module.exports = async () => {
  await new Promise(resolve => setTimeout(() => resolve(), 500)); // Add a small delay
};
