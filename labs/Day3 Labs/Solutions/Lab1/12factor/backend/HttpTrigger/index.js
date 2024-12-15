module.exports = async function (context, req) {
    context.res = {
      body: { message: 'Hello from the Azure Function backend!' }
    };
  };