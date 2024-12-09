import { FastifyReply, FastifyRequest } from "fastify";

export async function VerifyToken(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const token = request.headers.authorization;
    if (!token) {
      return reply.status(401).send({ message: "Authentication required" });
    }

    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
}
