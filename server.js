const local = 'http://localhost:6369/api';
const ec2 = 'http://ec2-54-190-44-86.us-west-2.compute.amazonaws.com:6369/api';

// root is hardcoded into nuxt config as well
export const server = {
  root: ec2,
  socket_root: ec2,
};
