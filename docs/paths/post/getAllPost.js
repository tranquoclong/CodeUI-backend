module.exports = {
  get: {
    tags: ["Post"],
    summary: "Return all posts",
    parameters: [
      {
        in: "query",
        name: "page",
        description: "page",
        schema: {
          type: "integer",
        },
      },
      {
        in: "query",
        name: "perPage",
        description: "perPage",
        schema: {
          type: "integer",
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
