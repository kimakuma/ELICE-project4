import { Request, RequestHandler } from "express";
import jwt from "jsonwebtoken";
export const tokenValidator: RequestHandler = (req, res, next) => {
  // request 헤더로부터 authorization bearer 토큰을 받음.
  if (!req.headers.authorization) {
    return res.status(403).json({
      result: "forbidden-approach",
      msg: "로그인한 유저만 사용할 수 있는 서비스입니다.\n토큰을 제시해 주세요.",
    });
  }
  const userToken = req.headers["authorization"].split(" ")[1];
  // 해당 token 이 정상적인 token인지 확인
  try {
    const secretKey = process.env.JWT_SECRET_KEY || "secret";
    const jwtDecoded = jwt.verify(userToken, secretKey);
    req.body = jwtDecoded;
    next();
  } catch (error) {
    // jwt.verify 함수가 에러를 발생시키는 경우는 토큰이 정상적으로 decode 안되었을 경우임.
    // 403 코드로 JSON 형태로 프론트에 전달함.
    console.log(error.message);
    switch (error.message) {
      case "invalid signature":
        const notAllow = new Error("404, 우리가 서명한 토큰이 아닙니다.");
        next(notAllow);
        break;
      case "jwt expired":
        const expired = new Error("403, 만료된 토큰입니다.");
        next(expired);
        break;
      default:
        next(new Error("400, 토큰 검증 도중 오류가 발생했습니다."));
    }
  }
};

// };
