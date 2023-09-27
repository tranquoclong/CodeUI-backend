module.exports = {
  delete: {
    tags: ["Post"],
    summary: "Delete post",
    parameters: [
      {
        in: "path",
        name: "postId",
        security: [{ BearerAuth: [] }],
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
