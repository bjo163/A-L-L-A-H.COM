import { logger } from '@allah/arsy-core';
import { dbEngine, modelRegistry } from '@allah/arsy-orm';
import crypto from 'crypto';
import dgram from 'dgram';

// Register Sentinel models
import './models/sentinel_account';
import './models/sentinel_session';

/**
 * RADIUS Packet Codes (RFC 2865/2866)
 */
export const RadiusCode = {
  AccessRequest: 1,
  AccessAccept: 2,
  AccessReject: 3,
  AccountingRequest: 4,
  AccountingResponse: 5,
  AccessChallenge: 11,
  StatusServer: 12,
  StatusClient: 13,
} as const;

export type RadiusCode = typeof RadiusCode[keyof typeof RadiusCode];

/**
 * RADIUS Attribute Types (RFC 2865/2866 subset)
 */
export const RadiusAttributeType = {
  UserName: 1,
  UserPassword: 2,
  CHAPPassword: 3,
  NASIPAddress: 4,
  NASPort: 5,
  ServiceType: 6,
  FramedProtocol: 7,
  FramedIPAddress: 8,
  FramedIPNetmask: 9,
  FramedRouting: 10,
  FilterId: 11,
  FramedMTU: 12,
  FramedCompression: 13,
  LoginIPHost: 14,
  LoginService: 15,
  LoginTCPPort: 16,
  ReplyMessage: 18,
  CallbackNumber: 19,
  CallbackId: 20,
  FramedRoute: 22,
  FramedIPXNetwork: 23,
  State: 24,
  Class: 25,
  VendorSpecific: 26,
  SessionTimeout: 27,
  IdleTimeout: 28,
  TerminationAction: 29,
  CalledStationId: 30,
  CallingStationId: 31,
  NASIdentifier: 32,
  ProxyState: 33,
  LoginLATService: 34,
  LoginLATNode: 35,
  LoginLATGroup: 36,
  FramedAppleTalkLink: 37,
  FramedAppleTalkNetwork: 38,
  FramedAppleTalkZone: 39,
  AcctStatusType: 40,
  AcctDelayTime: 41,
  AcctInputOctets: 42,
  AcctOutputOctets: 43,
  AcctSessionId: 44,
  AcctAuthentic: 45,
  AcctSessionTime: 46,
  AcctInputPackets: 47,
  AcctOutputPackets: 48,
  AcctTerminateCause: 49,
  AcctMultiSessionId: 50,
  AcctLinkCount: 51,
  AcctInputGigawords: 52,
  AcctOutputGigawords: 53,
  EventTimestamp: 55,
  NASPortType: 61,
  PortLimit: 62,
  LoginLATPort: 63,
} as const;

export type RadiusAttributeType = typeof RadiusAttributeType[keyof typeof RadiusAttributeType];

/**
 * RADIUS Vendor-Specific Attribute Types (RFC 2865 Vendor-Specific)
 */
export const RadiusVendorSpecificType = {
  MikrotikRateLimit: 2,
  MikrotikGroup: 3,
  MikrotikIdleTimeout: 4,
  MikrotikKeepaliveTimeout: 5,
  MikrotikDeadTime: 6,
  MikrotikAddressList: 7,
  MikrotikAddressPool: 8,
  MikrotikSubscribers: 9,
} as const;

export type RadiusVendorSpecificType = typeof RadiusVendorSpecificType[keyof typeof RadiusVendorSpecificType];

/**
 * RADIUS Packet Interface
 */
export interface RadiusPacket {
  code: number;
  identifier: number;
  length: number;
  authenticator: Buffer; // 16 bytes
  attributes: RadiusAttribute[];
}

/**
 * RADIUS Attribute Interface
 */
export interface RadiusAttribute {
  type: number;
  value: Buffer | string | number;
  vendorType?: number;
  vendorId?: number; // For vendor-specific attributes
}

/**
 * RADIUS Packet Encoder/Decoder
 */
export class RadiusCodec {
  private static readonly RESPONSE_AUTHENTICATOR_OFFSET = 2; // Length + Authenticator

  /**
   * Parse a RADIUS packet from a Buffer
   * @throws {Error} if packet is malformed
   */
  static parsePacket(buffer: Buffer): RadiusPacket {
    // Minimum RADIUS packet size: 20 bytes (Header) + 2 bytes (min attribute)
    if (buffer.length < 20) {
      throw new Error(`RADIUS packet too short: ${buffer.length} bytes (min 20)`);
    }

    // Header: Code (1), Identifier (1), Length (2), Authenticator (16)
    const code = buffer.readUInt8(0);
    const identifier = buffer.readUInt8(1);
    const length = buffer.readUInt16BE(2);
    const authenticator = buffer.slice(4, 20);

    if (length < 20) {
      throw new Error(`Invalid RADIUS packet length: ${length} (min 20)`);
    }

    if (length > 4096) {
      throw new Error(`RADIUS packet too long: ${length} (max 4096)`);
    }

    if (buffer.length < length) {
      throw new Error(`Truncated RADIUS packet: expected ${length}, got ${buffer.length}`);
    }

     // Parse attributes (TLV format)
     const attributes: RadiusAttribute[] = [];
     let pos = 20;

     while (pos < length) {
       if (pos + 2 > length) {
         throw new Error(`Incomplete attribute header at position ${pos}`);
       }

       const type = buffer.readUInt8(pos);
       const attrLength = buffer.readUInt8(pos + 1);

       if (attrLength < 2) {
         throw new Error(`Invalid attribute length: ${attrLength} (min 2)`);
       }

       if (pos + attrLength > length) {
         throw new Error(`Attribute exceeds packet bounds at position ${pos}`);
       }

if (type === RadiusAttributeType.VendorSpecific) {
         // Vendor-Specific attribute
         if (attrLength < 6) {
           throw new Error(`Vendor-Specific attribute too short: ${attrLength} (min 6)`);
         }

         const vendorId = buffer.readUInt32BE(pos + 2);
         const vendorType = buffer.readUInt8(pos + 6);
         const vendorLength = buffer.readUInt8(pos + 7);

         if (vendorLength + 8 > attrLength) {
           throw new Error(`Vendor-Specific attribute length mismatch: ${vendorLength} vs ${attrLength - 8}`);
         }

         const value = buffer.slice(pos + 8, pos + 8 + vendorLength);
         attributes.push({
           type,
           value,
           vendorId,
           vendorType,
         });
         pos += attrLength;
       } else {
         // Standard attribute
         const value = buffer.slice(pos + 2, pos + attrLength);
         attributes.push({
           type,
           value,
         });
         pos += attrLength;
       }
     }

    if (pos !== length) {
      throw new Error(`Packet parsing incomplete: ${pos} vs ${length}`);
    }

    return {
      code,
      identifier,
      length,
      authenticator,
      attributes,
    };
  }

  /**
   * Encode a RADIUS packet to a Buffer
   * @param packet The packet to encode
   * @param secret The shared secret for response authenticator calculation
   * @returns Buffer containing the encoded packet
   */
  static encodePacket(packet: RadiusPacket, secret: string): Buffer {
    // Calculate total length
    let totalLength = 20; // Header

    for (const attr of packet.attributes) {
       if (attr.vendorType !== undefined) {
         // Vendor-specific attribute: Type(1) + Length(1) + VendorID(4) + VendorType(1) + VendorLength(1) + Value
         totalLength += 1 + 1 + 4 + 1 + 1 + (Buffer.isBuffer(attr.value) ? attr.value.length : typeof attr.value === 'string' ? Buffer.byteLength(attr.value, 'utf8') : 4);
       } else {
         // Standard attribute: Type(1) + Length(1) + Value
         totalLength += 1 + 1 + (Buffer.isBuffer(attr.value) ? attr.value.length : typeof attr.value === 'string' ? Buffer.byteLength(attr.value, 'utf8') : 4);
       }
    }

    const buffer = Buffer.alloc(totalLength);
    let pos = 0;

    // Write header
    buffer.writeUInt8(packet.code, pos++);
    buffer.writeUInt8(packet.identifier, pos++);
    buffer.writeUInt16BE(totalLength, pos); pos += 2;
    packet.authenticator.copy(buffer, pos); pos += 16;

// Write attributes
    for (const attr of packet.attributes) {
      if (attr.vendorType !== undefined) {
        // Vendor-specific attribute
        buffer.writeUInt8(RadiusAttributeType.VendorSpecific, pos++);
        const lengthPos = pos++;
        buffer.writeUInt32BE(attr.vendorId || 0, pos); pos += 4;
        buffer.writeUInt8(attr.vendorType, pos++);
        const vendorLengthPos = pos++;
        
        // Write value
        let valueLength = 0;
        if (Buffer.isBuffer(attr.value)) {
          attr.value.copy(buffer, pos);
          valueLength = attr.value.length;
        } else if (typeof attr.value === 'string') {
          buffer.write(attr.value, pos, 'utf8');
          valueLength = Buffer.byteLength(attr.value, 'utf8');
        } else if (typeof attr.value === 'number') {
          buffer.writeUInt32BE(attr.value, pos);
          valueLength = 4;
        }
        buffer.writeUInt8(valueLength, vendorLengthPos); // VendorLength

        // Set total length (1 + 1 + 4 + 1 + 1 + valueLength) = 8 + valueLength
        buffer.writeUInt8(8 + valueLength, lengthPos);
        pos += valueLength;
      } else {
        // Standard attribute
        buffer.writeUInt8(attr.type, pos++);
        
        // Determine value length
        let valueLength = 0;
        if (Buffer.isBuffer(attr.value)) {
          valueLength = attr.value.length;
        } else if (typeof attr.value === 'string') {
          valueLength = Buffer.byteLength(attr.value, 'utf8');
        } else if (typeof attr.value === 'number') {
          valueLength = 4;
        }
        
        buffer.writeUInt8(2 + valueLength, pos++);
        
        // Write value
        if (Buffer.isBuffer(attr.value)) {
          attr.value.copy(buffer, pos);
        } else if (typeof attr.value === 'string') {
          buffer.write(attr.value, pos, 'utf8');
        } else if (typeof attr.value === 'number') {
          buffer.writeUInt32BE(attr.value, pos);
        }
        
        pos += valueLength;
      }
    }

    // Calculate and set Response Authenticator for Access-Accept, Access-Reject, Access-Challenge
    if (packet.code === RadiusCode.AccessAccept || packet.code === RadiusCode.AccessReject || packet.code === RadiusCode.AccessChallenge) {
      const responseAuth = this.calculateResponseAuthenticator(buffer, secret);
      responseAuth.copy(buffer, 4); // Overwrite authenticator field
    }

    return buffer;
  }

  /**
   * Calculate RFC 2865 Response Authenticator
   * MD5(Code + Identifier + Length + RequestAuth + Attributes + Secret)
   */
  private static calculateResponseAuthenticator(packetBuffer: Buffer, secret: string): Buffer {
    // Create a copy without the authenticator field (set to zeros for calculation)
    const calcBuffer = Buffer.alloc(packetBuffer.length);
    packetBuffer.copy(calcBuffer);
    calcBuffer.fill(0, 4, 20); // Zero out authenticator

    // Append secret
    const secretBuffer = Buffer.from(secret, 'utf8');
    const input = Buffer.concat([calcBuffer, secretBuffer]);

    return crypto.createHash('md5').update(input).digest();
  }

  /**
   * Extract User-Password attribute and decrypt it using PAP (RFC 2865)
   * @param packet The parsed RADIUS packet
   * @param secret The shared secret
   * @returns Decrypted password string
   */
  static decryptPapPassword(packet: RadiusPacket, secret: string): string {
    const passwordAttr = packet.attributes.find(attr => attr.type === RadiusAttributeType.UserPassword);
    if (!passwordAttr || !Buffer.isBuffer(passwordAttr.value)) {
      throw new Error('User-Password attribute not found or invalid');
    }

    if (passwordAttr.value.length !== 16) {
      throw new Error(`Invalid User-Password length: ${passwordAttr.value.length} (expected 16)`);
    }

    // PAP decryption: MD5(Secret + RequestAuth) XOR Ciphertext
    const hashInput = Buffer.concat([Buffer.from(secret, 'utf8'), packet.authenticator]);
    const md5Hash = crypto.createHash('md5').update(hashInput).digest();

    const decrypted = Buffer.alloc(16);
    for (let i = 0; i < 16; i++) {
      decrypted[i] = passwordAttr.value[i] ^ md5Hash[i];
    }

    // Find null terminator
    const nullIndex = decrypted.indexOf(0);
    if (nullIndex !== -1) {
      return decrypted.slice(0, nullIndex).toString('utf8');
    }

    return decrypted.toString('utf8');
  }

  /**
   * Constant-time comparison to prevent timing attacks
   */
  static constantTimeEqual(a: Buffer, b: Buffer): boolean {
    return crypto.timingSafeEqual(a, b);
  }
}

/**
 * RADIUS UDP Server
 */
export class RadiusServer {
  private readonly authServer: dgram.Socket;
  private readonly acctServer: dgram.Socket;
  private readonly sharedSecret: string;
  private isRunning = false;

  constructor(sharedSecret: string, authPort = 1812, acctPort = 1813) {
    this.sharedSecret = sharedSecret;
    this.authServer = dgram.createSocket('udp4');
    this.acctServer = dgram.createSocket('udp4');

    this.setupAuthServer(authPort);
    this.setupAcctServer(acctPort);
  }

  private setupAuthServer(port: number) {
    this.authServer.on('listening', () => {
      const address = this.authServer.address();
      logger.info(`RADIUS Auth server listening on ${address.address}:${address.port}`);
    });

this.authServer.on('message', async (msg, rinfo) => {
       logger.info(`RADIUS Auth request from ${rinfo.address}:${rinfo.port} (${msg.length} bytes)`);

       try {
         const packet = RadiusCodec.parsePacket(msg);
         const response = await this.handleAccessRequest(packet, rinfo);
         if (response) {
           this.authServer.send(response, rinfo.port, rinfo.address);
         }
       } catch (err) {
         logger.error({ err }, 'RADIUS Auth packet processing failed');
         // Send Access-Reject for malformed packets
         const reject = this.createAccessReject(0, 'Malformed packet');
         this.authServer.send(reject, rinfo.port, rinfo.address);
       }
     });

     this.authServer.on('error', (err) => {
       logger.error({ err }, 'RADIUS Auth server error');
     });

     this.authServer.on('error', (err) => {
       logger.error({ err }, 'RADIUS Auth server error');
     });

    this.authServer.bind(port);
  }

  private setupAcctServer(port: number) {
    this.acctServer.on('listening', () => {
      const address = this.acctServer.address();
      logger.info(`RADIUS Acct server listening on ${address.address}:${address.port}`);
    });

     this.acctServer.on('message', async (msg, rinfo) => {
       logger.info(`RADIUS Acct request from ${rinfo.address}:${rinfo.port}`);

       let packet: RadiusPacket | null = null;
       try {
         packet = RadiusCodec.parsePacket(msg);
         await this.handleAccountingRequest(packet, rinfo);
         // Send Accounting-Response
         const response = this.createAccountingResponse(packet);
         this.acctServer.send(response, rinfo.port, rinfo.address);
       } catch (err) {
         logger.error({ err }, 'RADIUS Acct packet processing failed');
         // Send Accounting-Response if packet was parsed
         if (packet) {
           const response = this.createAccountingResponse(packet);
           this.acctServer.send(response, rinfo.port, rinfo.address);
         }
       }
     });

     this.acctServer.on('error', (err) => {
       logger.error({ err }, 'RADIUS Acct server error');
     });

    this.acctServer.bind(port);
  }

  private async handleAccessRequest(packet: RadiusPacket, rinfo: dgram.RemoteInfo): Promise<Buffer | null> {
    if (packet.code !== RadiusCode.AccessRequest) {
      logger.warn(`Unexpected packet code: ${packet.code}`);
      return null;
    }

    // Extract attributes
    const username = packet.attributes.find(attr => attr.type === RadiusAttributeType.UserName);
    const password = packet.attributes.find(attr => attr.type === RadiusAttributeType.UserPassword);
    const nasIp = packet.attributes.find(attr => attr.type === RadiusAttributeType.NASIPAddress);
    const nasPort = packet.attributes.find(attr => attr.type === RadiusAttributeType.NASPort);
    const calledStationId = packet.attributes.find(attr => attr.type === RadiusAttributeType.CalledStationId);
    const callingStationId = packet.attributes.find(attr => attr.type === RadiusAttributeType.CallingStationId);

    if (!username || !Buffer.isBuffer(username.value)) {
      logger.warn('Missing User-Name attribute');
      return this.createAccessReject(packet.identifier, 'Missing User-Name');
    }

    if (!password || !Buffer.isBuffer(password.value)) {
      logger.warn('Missing User-Password attribute');
      return this.createAccessReject(packet.identifier, 'Missing User-Password');
    }

const usernameStr = username.value.toString('utf8');
    const passwordStr = RadiusCodec.decryptPapPassword(packet, this.sharedSecret);

    const nasIpStr = nasIp && Buffer.isBuffer(nasIp.value) ? nasIp.value.toString('utf8') : undefined;
    const nasPortNum = nasPort && Buffer.isBuffer(nasPort.value) ? nasPort.value.readUInt32BE(0) : undefined;
    const calledStationIdStr = calledStationId && Buffer.isBuffer(calledStationId.value) ? calledStationId.value.toString('utf8') : undefined;
    const callingStationIdStr = callingStationId && Buffer.isBuffer(callingStationId.value) ? callingStationId.value.toString('utf8') : undefined;

    logger.debug({ nasIp: nasIpStr, nasPort: nasPortNum, calledStationId: calledStationIdStr, callingStationId: callingStationIdStr }, `RADIUS Auth attempt: ${usernameStr} from ${rinfo.address}`);

    // TODO: Query database for user credentials and access policy (refactor)
    // For now, we'll reject all requests - this is Phase 1 (packet codec only)
    return this.createAccessReject(packet.identifier, 'Authentication not implemented');
  }

  private async handleAccountingRequest(packet: RadiusPacket, rinfo: dgram.RemoteInfo): Promise<void> {
    if (packet.code !== RadiusCode.AccountingRequest) {
      logger.warn(`Unexpected accounting packet code: ${packet.code}`);
      return;
    }

// Extract attributes
    const sessionId = packet.attributes.find(attr => attr.type === RadiusAttributeType.AcctSessionId);
    const statusType = packet.attributes.find(attr => attr.type === RadiusAttributeType.AcctStatusType);
    const nasIp = packet.attributes.find(attr => attr.type === RadiusAttributeType.NASIPAddress);
    const nasPort = packet.attributes.find(attr => attr.type === RadiusAttributeType.NASPort);
    const userName = packet.attributes.find(attr => attr.type === RadiusAttributeType.UserName);
    const acctSessionTime = packet.attributes.find(attr => attr.type === RadiusAttributeType.AcctSessionTime);
    const acctInputOctets = packet.attributes.find(attr => attr.type === RadiusAttributeType.AcctInputOctets);
    const acctOutputOctets = packet.attributes.find(attr => attr.type === RadiusAttributeType.AcctOutputOctets);

    const sessionIdStr = sessionId && Buffer.isBuffer(sessionId.value) ? sessionId.value.toString('utf8') : undefined;
    const statusTypeNum = statusType && Buffer.isBuffer(statusType.value) ? statusType.value.readUInt8(0) : undefined;
    const nasIpStr2 = nasIp && Buffer.isBuffer(nasIp.value) ? nasIp.value.toString('utf8') : undefined;
    const nasPortNum = nasPort && Buffer.isBuffer(nasPort.value) ? nasPort.value.readUInt32BE(0) : undefined;
    const userNameStr = userName && Buffer.isBuffer(userName.value) ? userName.value.toString('utf8') : undefined;
    const acctSessionTimeNum = acctSessionTime && Buffer.isBuffer(acctSessionTime.value) ? acctSessionTime.value.readUInt32BE(0) : undefined;
    const acctInputOctetsNum = acctInputOctets && Buffer.isBuffer(acctInputOctets.value) ? acctInputOctets.value.readUInt32BE(0) : undefined;
    const acctOutputOctetsNum = acctOutputOctets && Buffer.isBuffer(acctOutputOctets.value) ? acctOutputOctets.value.readUInt32BE(0) : undefined;

    logger.info({ userName: userNameStr, nasIp: nasIpStr2, nasPort: nasPortNum, acctSessionTime: acctSessionTimeNum, acctInputOctets: acctInputOctetsNum, acctOutputOctets: acctOutputOctetsNum }, `RADIUS Acct: ${statusTypeNum} session ${sessionIdStr} from ${rinfo.address}`);

    // TODO: Store accounting data in PGlite (sentinel.session) (refactor)
  }

  private createAccessReject(identifier: number, reason: string): Buffer {
    const packet: RadiusPacket = {
      code: RadiusCode.AccessReject,
      identifier,
      length: 20, // Will be updated by encodePacket
      authenticator: crypto.randomBytes(16),
      attributes: [
        {
          type: RadiusAttributeType.ReplyMessage,
          value: reason,
        },
      ],
    };

    return RadiusCodec.encodePacket(packet, this.sharedSecret);
  }

  private createAccountingResponse(packet: RadiusPacket): Buffer {
    const response: RadiusPacket = {
      code: RadiusCode.AccountingResponse,
      identifier: packet.identifier,
      length: 20,
      authenticator: crypto.randomBytes(16),
      attributes: [],
    };

    return RadiusCodec.encodePacket(response, this.sharedSecret);
  }

  async start(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;
    logger.info('RADIUS server started');
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;
    this.isRunning = false;
    this.authServer.close();
    this.acctServer.close();
    logger.info('RADIUS server stopped');
  }

  getSharedSecret(): string {
    return this.sharedSecret;
  }
}

// Export classes and interfaces