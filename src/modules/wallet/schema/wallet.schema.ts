import { Static, Type } from "@sinclair/typebox";
import { ErrorResponseSchema } from "../../../shared/schemas/error-response.schema";

export const TransferBodyObject = Type.Object({
  amount: Type.Number(),
  card: Type.String(),
});

export const WalletResponseSchema = Type.Object({
  id: Type.String(),
  wallet: Type.String(),
  balance: Type.Number(),
});

export const TransferResponseSchema = Type.Object({
  balance: Type.Number(),
});

export type TransferType = Static<typeof TransferBodyObject>;

export const transferMoneySchema = {
  schema: {
    body: TransferBodyObject,
    response: {
      201: TransferResponseSchema,
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  },
};

export const getWalletSchema = {
  schema: {
    response: {
      200: WalletResponseSchema,
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  },
};
