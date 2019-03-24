'use strict';

function Decoder(buffer) {
  this.offset = 0;
  this.buffer = buffer;
}

Decoder.prototype.array = function (length) {
  const value = new Array(length);
  for (let i = 0; i < length; i++) {
    value[i] = this.parse();
  }
  return value;
};

Decoder.prototype.map = function (length) {
  let key = '', value = {};
  for (let i = 0; i < length; i++) {
    key = this.parse();
    value[key] = this.parse();
  }
  return value;
};

Decoder.prototype.str = function (length) {
  const value = this.buffer.toString('utf8', this.offset, this.offset + length);
  this.offset += length;
  return value;
};

Decoder.prototype.bin = function (length) {
  const value = this.buffer.slice(this.offset, this.offset + length);
  this.offset += length;
  return value;
};

Decoder.prototype.arraybuffer = function (length) {
  const buffer = new ArrayBuffer(length);
  const view = new Uint8Array(buffer);
  for (let j = 0; j < length; j++) {
    view[j] = this.buffer[this.offset + j];
  }
  this.offset += length;
  return buffer;
};

Decoder.prototype.parse = function () {
  const prefix = this.buffer[this.offset++];
  let value, length = 0, type = 0, hi = 0, lo = 0;

  if (prefix < 0xc0) {
    // positive fixint
    if (prefix < 0x80) {
      return prefix;
    }
    // fixmap
    if (prefix < 0x90) {
      return this.map(prefix & 0x0f);
    }
    // fixarray
    if (prefix < 0xa0) {
      return this.array(prefix & 0x0f);
    }
    // fixstr
    return this.str(prefix & 0x1f);
  }

  // negative fixint
  if (prefix > 0xdf) {
    return (0xff - prefix + 1) * -1;
  }

  switch (prefix) {
    // nil
    case 0xc0:
      return null;
    // false
    case 0xc2:
      return false;
    // true
    case 0xc3:
      return true;

    // bin
    case 0xc4:
      length = this.buffer.readUInt8(this.offset);
      this.offset += 1;
      return this.bin(length);
    case 0xc5:
      length = this.buffer.readUInt16BE(this.offset);
      this.offset += 2;
      return this.bin(length);
    case 0xc6:
      length = this.buffer.readUInt32BE(this.offset);
      this.offset += 4;
      return this.bin(length);

    // ext
    case 0xc7:
      length = this.buffer.readUInt8(this.offset);
      type = this.buffer.readInt8(this.offset + 1);
      this.offset += 2;
      if (type === 0) { // ArrayBuffer
        return this.arraybuffer(length);
      }
      return [type, this.bin(length)];
    case 0xc8:
      length = this.buffer.readUInt16BE(this.offset);
      type = this.buffer.readInt8(this.offset + 2);
      this.offset += 3;
      if (type === 0) { // ArrayBuffer
        return this.arraybuffer(length);
      }
      return [type, this.bin(length)];
    case 0xc9:
      length = this.buffer.readUInt32BE(this.offset);
      type = this.buffer.readInt8(this.offset + 4);
      this.offset += 5;
      if (type === 0) { // ArrayBuffer
        return this.arraybuffer(length);
      }
      return [type, this.bin(length)];

    // float
    case 0xca:
      value = this.buffer.readFloatBE(this.offset);
      this.offset += 4;
      return value;
    case 0xcb:
      value = this.buffer.readDoubleBE(this.offset);
      this.offset += 8;
      return value;

    // uint
    case 0xcc:
      value = this.buffer.readUInt8(this.offset);
      this.offset += 1;
      return value;
    case 0xcd:
      value = this.buffer.readUInt16BE(this.offset);
      this.offset += 2;
      return value;
    case 0xce:
      value = this.buffer.readUInt32BE(this.offset);
      this.offset += 4;
      return value;
    case 0xcf:
      hi = this.buffer.readUInt32BE(this.offset) * Math.pow(2, 32);
      lo = this.buffer.readUInt32BE(this.offset + 4);
      this.offset += 8;
      return hi + lo;

    // int
    case 0xd0:
      value = this.buffer.readInt8(this.offset);
      this.offset += 1;
      return value;
    case 0xd1:
      value = this.buffer.readInt16BE(this.offset);
      this.offset += 2;
      return value;
    case 0xd2:
      value = this.buffer.readInt32BE(this.offset);
      this.offset += 4;
      return value;
    case 0xd3:
      hi = this.buffer.readInt32BE(this.offset) * Math.pow(2, 32);
      lo = this.buffer.readUInt32BE(this.offset + 4);
      this.offset += 8;
      return hi + lo;

    // fixext
    case 0xd4:
      type = this.buffer.readInt8(this.offset);
      this.offset += 1;
      if (type === 0x00) {
        this.offset += 1;
        return void 0;
      }
      return [type, this.bin(1)];
    case 0xd5:
      type = this.buffer.readInt8(this.offset);
      this.offset += 1;
      return [type, this.bin(2)];
    case 0xd6:
      type = this.buffer.readInt8(this.offset);
      this.offset += 1;
      return [type, this.bin(4)];
    case 0xd7:
      type = this.buffer.readInt8(this.offset);
      this.offset += 1;
      if (type === 0x00) {
        hi = this.buffer.readInt32BE(this.offset) * Math.pow(2, 32);
        lo = this.buffer.readUInt32BE(this.offset + 4);
        this.offset += 8;
        return new Date(hi + lo);
      }
      return [type, this.bin(8)];
    case 0xd8:
      type = this.buffer.readInt8(this.offset);
      this.offset += 1;
      return [type, this.bin(16)];

    // str
    case 0xd9:
      length = this.buffer.readUInt8(this.offset);
      this.offset += 1;
      return this.str(length);
    case 0xda:
      length = this.buffer.readUInt16BE(this.offset);
      this.offset += 2;
      return this.str(length);
    case 0xdb:
      length = this.buffer.readUInt32BE(this.offset);
      this.offset += 4;
      return this.str(length);

    // array
    case 0xdc:
      length = this.buffer.readUInt16BE(this.offset);
      this.offset += 2;
      return this.array(length);
    case 0xdd:
      length = this.buffer.readUInt32BE(this.offset);
      this.offset += 4;
      return this.array(length);

    // map
    case 0xde:
      length = this.buffer.readUInt16BE(this.offset);
      this.offset += 2;
      return this.map(length);
    case 0xdf:
      length = this.buffer.readUInt32BE(this.offset);
      this.offset += 4;
      return this.map(length);
  }

  throw new Error('Could not parse');
};

function decode(buffer) {
  const decoder = new Decoder(buffer);
  const value = decoder.parse();
  if (decoder.offset !== buffer.length) {
    throw new Error((buffer.length - decoder.offset) + ' trailing bytes');
  }
  return value;
}

module.exports = decode;
