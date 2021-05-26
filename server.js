const local = 'http://localhost:6369/api';
const ec2 = 'http://ec2-54-190-44-86.us-west-2.compute.amazonaws.com:6369/api';
const cf = 'https://d31e8aiboh7enn.cloudfront.net/api';

// root is hardcoded into nuxt config as well
export const server = {
  root: cf,
  socket_root: cf,
};

