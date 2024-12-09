import { Static, Type } from "@sinclair/typebox";
import { ErrorResponseSchema } from "../../../shared/schemas/error-response.schema";

export const HistoryObject = Type.Object({
  id: Type.String(),
  amount: Type.Number(),
  action: Type.String(),
  wallet_id: Type.String(),
  status: Type.String(),
  date: Type.String(),
  comment: Type.String() || Type.Null(),
  card: Type.String() || Type.Null(),
  wallet: Type.String() || Type.Null(),
  transact_id: Type.String() || Type.Null(),
});

export const HistoryResponseArray = Type.Array(
  Type.Object({
    amount: Type.Number(),
    date: Type.String(),
    items: Type.Array(HistoryObject),
  })
);

export const HistoryBodyObject = Type.Object({
  id: Type.String(),
});

export const ParamsObject = Type.Object({
  id: Type.String(),
});

export type HistoryRequestType = Static<typeof HistoryBodyObject>;
export type ParamsType = Static<typeof ParamsObject>;

export const UserHistorySchema = {
  schema: {
    params: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
      },
    },
    response: {
      200: HistoryResponseArray,
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  },
};

export const SearchHistorySchema = {
  schema: {
    querystring: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
      },
    },
    response: {
      200: Type.Array(HistoryObject),
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  },
};
