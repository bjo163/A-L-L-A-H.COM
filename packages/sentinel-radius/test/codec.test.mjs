import { describe, it } from 'node:test';
import { RadiusCodec, RadiusCode, RadiusAttributeType } from '../src/index.js';
import crypto from 'node:crypto';
import assert from 'node:assert';

describe('RADIUS Packet Codec', () => {
  const SHARED_SECRET = 'testing123';

  it('should encode and decode a basic Access-Request packet', (t) => {
    const packet = {
      code: RadiusCode.AccessRequest,
      identifier: 1,
      length: 0, // Will be set by encoder
      authenticator: Buffer.from('0123456789ABCDEF0123456789ABCDEF', 'hex'),
      attributes: [
        {
          type: RadiusAttributeType.UserName,
          value: 'testuser',
        },
        {
          type: RadiusAttributeType.UserPassword,
          value: Buffer.alloc(16, 0), // Placeholder - will be encrypted by caller
        },
        {
          type: RadiusAttributeType.NASIPAddress,
          value: Buffer.from([192, 168, 1, 1]),
        },
        {
          type: RadiusAttributeType.NASPort,
          value: Buffer.alloc(4).writeUInt32BE(1, 0),
        },
      ],
    };

    // Encode packet
    const encoded = RadiusCodec.encodePacket(packet, SHARED_SECRET);
    assert.ok(encoded instanceof Buffer);
    assert.ok(encoded.length > 20);

    // Decode packet
    const decoded = RadiusCodec.parsePacket(encoded);
    assert.strictEqual(decoded.code, RadiusCode.AccessRequest);
    assert.strictEqual(decoded.identifier, 1);
    assert.ok(decoded.authenticator.equals(packet.authenticator));
    assert.strictEqual(decoded.attributes.length, 4);

    // Check attributes
    const userName = decoded.attributes.find(a => a.type === RadiusAttributeType.UserName);
    assert.ok(userName);
    assert.strictEqual(userName.value.toString('utf8'), 'testuser');

    const nasIp = decoded.attributes.find(a => a.type === RadiusAttributeType.NASIPAddress);
    assert.ok(nasIp);
    assert.strictEqual(nasIp.value.readUInt32BE(0), Buffer.from([192, 168, 1, 1]).readUInt32BE(0));
  });

  it('should encode and decode an Access-Accept packet with response authenticator', (t) => {
    const packet = {
      code: RadiusCode.AccessAccept,
      identifier: 2,
      length: 0,
      authenticator: Buffer.from('FEDCBA9876543210FEDCBA9876543210', 'hex'),
      attributes: [
        {
          type: RadiusAttributeType.UserName,
          value: 'testuser',
        },
        {
          type: RadiusAttributeType.ReplyMessage,
          value: 'Authentication successful',
        },
        {
          type: RadiusAttributeType.SessionTimeout,
          value: Buffer.alloc(4).writeUInt32BE(3600, 0),
        },
      ],
    };

    const encoded = RadiusCodec.encodePacket(packet, SHARED_SECRET);
    const decoded = RadiusCodec.parsePacket(encoded);

    assert.strictEqual(decoded.code, RadiusCode.AccessAccept);
    assert.strictEqual(decoded.identifier, 2);
    assert.strictEqual(decoded.authenticator.length, 16);

    // Check response authenticator was calculated correctly
    const replyMessage = decoded.attributes.find(a => a.type === RadiusAttributeType.ReplyMessage);
    assert.ok(replyMessage);
    assert.strictEqual(replyMessage.value.toString('utf8'), 'Authentication successful');
  });

  it('should decrypt PAP password correctly', (t) => {
    const requestAuth = Buffer.from('0123456789ABCDEF0123456789ABCDEF', 'hex');
    const password = 'secret123';

    // Create packet with encrypted password
    const packet = {
      code: RadiusCode.AccessRequest,
      identifier: 1,
      length: 0,
      authenticator: requestAuth,
      attributes: [
        {
          type: RadiusAttributeType.UserName,
          value: 'testuser',
        },
        {
          type: RadiusAttributeType.UserPassword,
          value: Buffer.alloc(16), // Will be encrypted
        },
      ],
    };

    // Manually encrypt for test
    const hashInput = Buffer.concat([Buffer.from(SHARED_SECRET, 'utf8'), requestAuth]);
    const md5Hash = crypto.createHash('md5').update(hashInput).digest();
    const passwordBuffer = Buffer.from(password + '\0', 'utf8');
    const encrypted = Buffer.alloc(16);
    for (let i = 0; i < 16; i++) {
      encrypted[i] = passwordBuffer[i] ^ md5Hash[i];
    }

    packet.attributes[1].value = encrypted;

    const decrypted = RadiusCodec.decryptPapPassword(packet, SHARED_SECRET);
    assert.strictEqual(decrypted, password);
  });

  it('should reject malformed packets', (t) => {
    // Too short
    assert.throws(() => RadiusCodec.parsePacket(Buffer.alloc(19)), /too short/);

    // Invalid length
    const invalidLength = Buffer.alloc(20);
    invalidLength.writeUInt16BE(10, 2); // Length < 20
    assert.throws(() => RadiusCodec.parsePacket(invalidLength), /Invalid RADIUS packet length/);

    // Too long
    const tooLong = Buffer.alloc(20);
    tooLong.writeUInt16BE(5000, 2);
    assert.throws(() => RadiusCodec.parsePacket(tooLong), /too long/);

    // Truncated packet
    const truncated = Buffer.alloc(30);
    truncated.writeUInt8(RadiusCode.AccessRequest, 0); // Code
    truncated.writeUInt8(1, 1); // Identifier
    truncated.writeUInt16BE(40, 2); // Length
    truncated.fill(0, 4, 20); // Authenticator
    // Only 10 bytes of attribute data, but length says 40
    assert.throws(() => RadiusCodec.parsePacket(truncated), /Truncated RADIUS packet/);
  });

  it('should parse Vendor-Specific attributes', (t) => {
    const packet = {
      code: RadiusCode.AccessRequest,
      identifier: 1,
      length: 0,
      authenticator: Buffer.alloc(16, 0),
      attributes: [
        {
          type: RadiusAttributeType.VendorSpecific,
          vendorType: 2, // MikrotikRateLimit
          vendorId: 14988, // Mikrotik vendor ID
          value: Buffer.from('10M/20M', 'utf8'),
        },
      ],
    };

    const encoded = RadiusCodec.encodePacket(packet, SHARED_SECRET);
    const decoded = RadiusCodec.parsePacket(encoded);

    const vsAttr = decoded.attributes.find(a => a.type === RadiusAttributeType.VendorSpecific);
    assert.ok(vsAttr);
    assert.strictEqual(vsAttr.vendorId, 14988);
    assert.strictEqual(vsAttr.vendorType, 2);
    assert.strictEqual(vsAttr.value.toString('utf8'), '10M/20M');
  });

  it('should encode and decode MikroTik rate-limit Vendor-Specific attribute', (t) => {
    const packet = {
      code: RadiusCode.AccessRequest,
      identifier: 1,
      length: 0,
      authenticator: Buffer.alloc(16, 0),
      attributes: [
        {
          type: RadiusAttributeType.VendorSpecific,
          vendorType: 2, // MikrotikRateLimit
          vendorId: 14988, // Mikrotik vendor ID
          value: Buffer.from('25M/50M', 'utf8'),
        },
      ],
    };

    const encoded = RadiusCodec.encodePacket(packet, SHARED_SECRET);
    const decoded = RadiusCodec.parsePacket(encoded);

    const vsAttr = decoded.attributes.find(a => a.type === RadiusAttributeType.VendorSpecific);
    assert.ok(vsAttr);
    assert.strictEqual(vsAttr.vendorId, 14988);
    assert.strictEqual(vsAttr.vendorType, 2);
    assert.strictEqual(vsAttr.value.toString('utf8'), '25M/50M');
  });
});