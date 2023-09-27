module.exports = {
  post: {
    tags: ["Auth"],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              name: {
                type: "string",
                example: "dragoncute",
              },
              email: {
                type: "string",
                example: "dragoncute@gmail.com",
              },
              password: {
                type: "string",
                example: "Dragoncute!123",
              },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: "Success",
      },
    },
  },
};
