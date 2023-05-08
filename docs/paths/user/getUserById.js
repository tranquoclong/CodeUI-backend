module.exports = {
  get: {
    tags: ["User"],
    summary: "Return user by ID",
    parameters: [
      {
        in: "path",
        name: "userId",
        security: [{ BearerAuth: [] }],
        // required: true,
        description: "User ID",
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
