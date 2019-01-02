const crypto = require('crypto');

const genRandomString = length => {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
};

const sha512 = (password, salt) => {
  const hash = crypto.createHmac(
    'sha512',
    process.env.SALT_HASH || '4shoalsalts4shoalshells'
  );
  hash.update(password);
  return hash.digest('hex');
};

module.exports = password => {
  const salt = genRandomString(16);
  return sha512(password, salt);
};
