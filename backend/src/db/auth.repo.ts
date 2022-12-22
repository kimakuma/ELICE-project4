import { dataSource, db } from ".";
import { EmailAuth } from "./schemas";
import * as utils from ".";
export const findOneAuthData = async (email: string) => {
  const data = await dataSource.getRepository(EmailAuth).findOne({ where: { email } });
  return data;
};
export const createAuthData = async (email: string, code: number) => {
  // const data = await db.query(`INSERT INTO user () VALUES ()`, [])
  const forAuthDB = dataSource.getRepository(EmailAuth).create({
    email,
    code,
  });
  await dataSource.getRepository(EmailAuth).save(forAuthDB);
  return forAuthDB;
};

export const updateAuthData = async (email: string, code: number) => {
  const target = await findOneAuthData(email);
  target.code = code;
  target.time = new Date();
  await dataSource.getRepository(EmailAuth).save(target);
  return;
};
