using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class AdaptivePng
{
    private struct PointColor
    {
        public int R;
        public int G;
        public int B;
        public int Count;
    }

    private sealed class Box
    {
        public List<PointColor> Points;
        public int RangeR;
        public int RangeG;
        public int RangeB;
        public long Weight;

        public Box(List<PointColor> points)
        {
            Points = points;
            var minR = 255;
            var maxR = 0;
            var minG = 255;
            var maxG = 0;
            var minB = 255;
            var maxB = 0;
            Weight = 0;

            foreach (var point in points)
            {
                minR = Math.Min(minR, point.R);
                maxR = Math.Max(maxR, point.R);
                minG = Math.Min(minG, point.G);
                maxG = Math.Max(maxG, point.G);
                minB = Math.Min(minB, point.B);
                maxB = Math.Max(maxB, point.B);
                Weight += point.Count;
            }

            RangeR = maxR - minR;
            RangeG = maxG - minG;
            RangeB = maxB - minB;
        }

        public int Range
        {
            get { return Math.Max(RangeR, Math.Max(RangeG, RangeB)); }
        }
    }

    public static void Quantize(string source, string destination)
    {
        using (var original = new Bitmap(source))
        using (var inputBitmap = new Bitmap(original.Width, original.Height, PixelFormat.Format32bppArgb))
        using (var output = new Bitmap(original.Width, original.Height, PixelFormat.Format8bppIndexed))
        {
            var width = original.Width;
            var height = original.Height;
            using (var graphics = Graphics.FromImage(inputBitmap))
            {
                graphics.DrawImageUnscaled(original, 0, 0);
            }

            var bounds = new Rectangle(0, 0, width, height);
            var inputData = inputBitmap.LockBits(bounds, ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
            var input = new byte[inputData.Stride * height];
            Marshal.Copy(inputData.Scan0, input, 0, input.Length);

            var sumR = new long[32768];
            var sumG = new long[32768];
            var sumB = new long[32768];
            var count = new int[32768];

            for (var y = 0; y < height; y++)
            {
                for (var x = 0; x < width; x++)
                {
                    var offset = y * inputData.Stride + x * 4;
                    var blue = input[offset];
                    var green = input[offset + 1];
                    var red = input[offset + 2];
                    var index = (red >> 3) << 10 | (green >> 3) << 5 | blue >> 3;
                    sumR[index] += red;
                    sumG[index] += green;
                    sumB[index] += blue;
                    count[index]++;
                }
            }

            var colors = new List<PointColor>();
            for (var i = 0; i < count.Length; i++)
            {
                if (count[i] > 0)
                {
                    colors.Add(new PointColor
                    {
                        R = (int)(sumR[i] / count[i]),
                        G = (int)(sumG[i] / count[i]),
                        B = (int)(sumB[i] / count[i]),
                        Count = count[i]
                    });
                }
            }

            var boxes = new List<Box> { new Box(colors) };
            while (boxes.Count < 256)
            {
                var best = -1;
                long score = -1;
                for (var i = 0; i < boxes.Count; i++)
                {
                    var candidate = (long)boxes[i].Range * boxes[i].Weight;
                    if (boxes[i].Points.Count > 1 && candidate > score)
                    {
                        best = i;
                        score = candidate;
                    }
                }

                if (best < 0)
                {
                    break;
                }

                var target = boxes[best];
                var axis = target.RangeR >= target.RangeG && target.RangeR >= target.RangeB
                    ? 0
                    : target.RangeG >= target.RangeB ? 1 : 2;
                var sorted = new List<PointColor>(target.Points);
                if (axis == 0)
                {
                    sorted.Sort((left, right) => left.R.CompareTo(right.R));
                }
                else if (axis == 1)
                {
                    sorted.Sort((left, right) => left.G.CompareTo(right.G));
                }
                else
                {
                    sorted.Sort((left, right) => left.B.CompareTo(right.B));
                }

                var half = (target.Weight + 1) / 2;
                long accumulated = 0;
                var split = 1;
                for (var i = 0; i < sorted.Count - 1; i++)
                {
                    accumulated += sorted[i].Count;
                    if (accumulated >= half)
                    {
                        split = i + 1;
                        break;
                    }
                }

                boxes[best] = new Box(sorted.GetRange(0, split));
                boxes.Add(new Box(sorted.GetRange(split, sorted.Count - split)));
            }

            var paletteColors = new Color[256];
            for (var i = 0; i < boxes.Count; i++)
            {
                long red = 0;
                long green = 0;
                long blue = 0;
                long weight = 0;
                foreach (var point in boxes[i].Points)
                {
                    red += (long)point.R * point.Count;
                    green += (long)point.G * point.Count;
                    blue += (long)point.B * point.Count;
                    weight += point.Count;
                }

                paletteColors[i] = Color.FromArgb(255, (int)(red / weight), (int)(green / weight), (int)(blue / weight));
            }

            for (var i = boxes.Count; i < paletteColors.Length; i++)
            {
                paletteColors[i] = paletteColors[boxes.Count - 1];
            }

            var lookup = new byte[32768];
            for (var i = 0; i < lookup.Length; i++)
            {
                var red = count[i] > 0 ? (int)(sumR[i] / count[i]) : ((i >> 10) & 31) * 8 + 4;
                var green = count[i] > 0 ? (int)(sumG[i] / count[i]) : ((i >> 5) & 31) * 8 + 4;
                var blue = count[i] > 0 ? (int)(sumB[i] / count[i]) : (i & 31) * 8 + 4;
                long bestDistance = long.MaxValue;
                var bestIndex = 0;
                for (var paletteIndex = 0; paletteIndex < boxes.Count; paletteIndex++)
                {
                    var deltaR = red - paletteColors[paletteIndex].R;
                    var deltaG = green - paletteColors[paletteIndex].G;
                    var deltaB = blue - paletteColors[paletteIndex].B;
                    var distance = deltaR * deltaR + deltaG * deltaG + deltaB * deltaB;
                    if (distance < bestDistance)
                    {
                        bestDistance = distance;
                        bestIndex = paletteIndex;
                    }
                }

                lookup[i] = (byte)bestIndex;
            }

            var palette = output.Palette;
            for (var i = 0; i < paletteColors.Length; i++)
            {
                palette.Entries[i] = paletteColors[i];
            }

            output.Palette = palette;
            var outputData = output.LockBits(bounds, ImageLockMode.WriteOnly, PixelFormat.Format8bppIndexed);
            var result = new byte[outputData.Stride * height];
            for (var y = 0; y < height; y++)
            {
                for (var x = 0; x < width; x++)
                {
                    var offset = y * inputData.Stride + x * 4;
                    var index = (input[offset + 2] >> 3) << 10 | (input[offset + 1] >> 3) << 5 | input[offset] >> 3;
                    result[y * outputData.Stride + x] = lookup[index];
                }
            }

            Marshal.Copy(result, 0, outputData.Scan0, result.Length);
            output.UnlockBits(outputData);
            inputBitmap.UnlockBits(inputData);
            output.Save(destination, ImageFormat.Png);
        }
    }
}
