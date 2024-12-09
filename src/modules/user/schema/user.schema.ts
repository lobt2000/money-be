import { Type } from "@sinclair/typebox";
import { ErrorResponseSchema } from "../../../shared/schemas/error-response.schema";

export const UserObject = Type.Object({
  id: Type.String(),
  email: Type.String({ format: "email" }),
  wallet_id: Type.String(),
});

export const UsersForChatObject = Type.Object({
  id: Type.String(),
  wallet: Type.String(),
});

export const UsersArray = Type.Array(UserObject);
export const UsersForChatArray = Type.Array(UsersForChatObject);

export const getUserSchema = {
  schema: {
    response: {
      200: UserObject,
      401: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  },
};

export const getUsersSchema = {
  schema: {
    response: {
      200: UsersArray,
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  },
};

export const getUsersForChatSchema = {
  schema: {
    response: {
      200: UsersForChatArray,
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  },
};
