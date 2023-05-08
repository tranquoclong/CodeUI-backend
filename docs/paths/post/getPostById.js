module.exports = {
  get: {
    tags: ["Post"],
    summary: "Return post by ID",
    parameters: [
      {
        in: "path",
        name: "postId",
        // required: true,
        description: "Post ID",
        schema: {
          type: "String",
        },
      },
    ],
    responses: {
      200: {
        description: "Success",
      },
    },
  },
};
