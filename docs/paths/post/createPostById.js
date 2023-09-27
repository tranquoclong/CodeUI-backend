module.exports = {
  post: {
    tags: ["Post"],
    summary: "Create post",
    security: [{ BearerAuth: [] }],
    parameters: [
      {
        in: "path",
        name: "userId",
        description: "userId ID",
        schema: {
          type: "String",
        },
      },
    ],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              photo: {
                type: "string",
                example:
                  "https://firebasestorage.googleapis.com/v0/b/bakery-9a92d.appspot.com/o/images%2F273406584_277615407774009_3293667689844875286_n.jpgcda1b402-63bb-498c-9450-b97af748e77a?alt=media&token=6926b464-8d26-426f-ba79-3a7022db6ab2",
              },
              title: {
                type: "string",
                example: "dragoncute@gmail.com",
              },
              body: {
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
