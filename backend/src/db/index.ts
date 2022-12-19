import { DataSource } from "typeorm";
require("dotenv").config();

export const dataSource = new DataSource({
  type: "mysql",
  host: "127.0.0.1",
  username: "root",
  password: process.env.MYSQL_PW || "비번",
  database: "company",
  port: 3306,
  entities: ["src/db/schemas/*.entity.ts"],
  logging: false,
  synchronize: true,
});

export * from "./auth.repo";
export * from "./user.repo";