import { db } from ".";
import { positonEnum, Resume } from "./schemas";
import { updateData, insertData } from "./utils/transData";
import { deleteBoard } from "./board.repo";
import {convertToArray} from "class-validator/types/utils";

// TODO] 프로젝트 생성, 프로젝트들 조회, 프로젝트 수정, 이력서 삭제

// 1-1. 이력서 (틀) 생성
export const createResumeQ = async (userId: number, newResumeName: string) => {
  const newResume = await db.query(
    `INSERT INTO resume(usedUserId, name)
                                    VALUES (?, ?)`,
    [userId, newResumeName]
  );

  return newResume;
};

// 1-2. 업무경험 생성
export const createCareerQ = async (resumeId: number, newCareerInfo: Record<string, string | number | boolean>) => {
  const [keys, values, arrValues] = insertData(newCareerInfo);

  const newCareer = await db.query(
    `INSERT INTO career (usedResumeId, ${keys.join(", ")})
     VALUES (?, ${values.join(",")})`,
    [resumeId, ...arrValues]
  );

  return newCareer;
};

// 1-3. 프로젝트 생성
// TODO] for문 수정
export const createProjectQ = async (resumeId: number, newProjectInfos: Record<string, string | number | boolean>) => {
  let conn = null;

  try {
    const {skills, ...newProjectInfo} = newProjectInfos;
    const [keys, values, arrValues] = insertData(newProjectInfo);

    if (skills) {
      const skillsList = Object.values(skills);

      conn = await db.getConnection();
      await conn.beginTransaction();

      const newProject = await conn.query(
        `INSERT INTO project (usedResumeId, ${keys.join(", ")})
       VALUES (?, ${values.join(",")})`,
        [resumeId, ...arrValues]
      );

      const projectId = Object.values(newProject[0])[2];

      const [ids, ] = await conn.query(`SELECT id AS skillId FROM skill WHERE name IN ("${skillsList.join('", "')}")`)

      const skillsIds = Object.values(ids);

      for (let i=0; i<skillsIds.length; i++) {
        await conn.query(`INSERT INTO stack (projectId, skillId) VALUES (?, ?)`, [projectId, Object.values(skillsIds[i])])
      }

      conn.commit();

      return newProject;
    } else {
      const newProject = await db.query(
        `INSERT INTO project (usedResumeId, ${keys.join(", ")})
       VALUES (?, ${values.join(",")})`,
        [resumeId, ...arrValues]
      );

      return newProject;
    }
  } catch {
    console.log('프로젝트 생성 실패')
    conn.rollback();
  } finally {
    if (conn) {
      await conn.release();
      console.log("✅ Transaction Finish");
    }
  }
};

// 2-2. 내 이력서 목록 조회
export const findMyResumesQ = async (userId: number) => {
  const [myResumes] = await db.query(
    `SELECT id          AS resumeId,
                                              name        AS resumeName,
                                              information AS intro,
                                              position,
                                              updatedAt,
                                              usedUserId  AS userId
                                       FROM resume
                                       WHERE usedUserId = ?`,
    userId
  );

  return myResumes;
};

// 2-3. 이력서 기본정보 상세 조회
export const findResumeQ = async (resumeId: number) => {
  const [resumeInfo] = await db.query(
    `SELECT id          AS resumeId,
                                               name        AS resumeName,
                                               information AS intro,
                                               position,
                                               updatedAt,
                                               usedUserId  AS userId
                                        FROM resume
                                        WHERE id = ?`,
    resumeId
  );

  return resumeInfo[0];
};

// 2-4. 업무경험들 조회
export const findCareersQ = async (resumeId: number) => {
  const [careers] = await db.query(
    `SELECT id           AS careerId,
                                            company,
                                            position,
                                            notDevlop,
                                            workNow,
                                            startDate,
                                            endDate,
                                            reward,
                                            usedResumeId AS resumeId
                                     FROM career
                                     WHERE usedResumeId = ?`,
    resumeId
  );

  return careers;
};

// 2-5. 프로젝트들 조회
// TODO] for문 수정
export const findProjectsQ = async (resumeId: number) => {
  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    const [projects] = await conn.query(
      `SELECT id AS projectId, projectName, year, information, link1, link2, usedResumeId AS resumeId
            FROM project
            WHERE usedResumeId = ?`,
      resumeId
    );

    for(let i=0; i<Object.values(projects).length; i++){
      const [skillName,] = await conn.query(
        `SELECT name AS stackName FROM stack JOIN skill ON stack.skillId = skill.id WHERE projectId = ${Object.values(projects)[i].projectId}`);

      for (let j=0; j<Object.values(skillName).length; j++) {
        skillName[j] = skillName[j].stackName
      }

      projects[i]['skills'] = skillName
    }

    conn.commit();

    return projects;
  } catch {
    console.log("프로젝트 정보 불러오기 실패");
    conn.rollback();
  } finally {
    if (conn) {
      await conn.release();
      console.log("✅ Transaction Finish");
    }
  }
};

// 2-6. 업무경험 조회
export const findCareerQ = async (careerId: number) => {
  const [career] = await db.query(
    `SELECT id           AS careerId,
                                           company,
                                           position,
                                           notDevlop,
                                           workNow,
                                           startDate,
                                           endDate,
                                           reward,
                                           usedResumeId AS resumeId
                                    FROM career
                                    WHERE id = ?`,
    careerId
  );

  return career;
};

// 2-7. 프로젝트 조회
// TODO] skill 받아오는거 쿼리 합치기
export const findProjectQ = async (projectId: number) => {
  const [project, ] = await db.query(
    `SELECT 
    id AS projectID,
    projectName,
    year,
    information,
    link1,
    link2,
    usedResumeId AS resumeId
    FROM project
    WHERE id = ?`,
    projectId
  );

  const [skillName,] = await db.query(
    `SELECT name AS stackName FROM stack JOIN skill ON stack.skillId = skill.id WHERE projectId = ?`, projectId);

  for (let j=0; j<Object.values(skillName).length; j++) {
    skillName[j] = skillName[j].stackName
  }

  project[0]['skills'] = skillName

  return project;
};

// 3-1. 이력서 기본정보 수정
export const updateResumeQ = async (resumeId: number, updateResumeInfo: Record<string, string | number>) => {
  const [key, value] = updateData(updateResumeInfo);

  const updatedResume = await db.query(
    `UPDATE resume
                                        SET ${key.join(", ")}
                                        WHERE id = ?`,
    [...value, resumeId]
  );

  return updatedResume;
};

// 3-2. 업무경험 수정
export const updateCareerQ = async (careerId: number, updateCareerInfo: Record<string, string | number>) => {
  const [key, value] = updateData(updateCareerInfo);

  const updatedCareer = await db.query(
    `UPDATE career
                                        SET ${key.join(", ")}
                                        WHERE id = ?`,
    [...value, careerId]
  );

  return updatedCareer;
};

// 3-3. 프로젝트 수정
// TODO] for문 수정
export const updateProjectQ = async (projectId: number, updateProjectInfos: Record<string, string | number>) => {
  let conn = null;

  try {
    const {skills, ...updateProjectInfo} = updateProjectInfos;

    const [key, value] = updateData(updateProjectInfo);

    if (skills) {
      const skillsList = Object.values(skills);

      conn = await db.getConnection();
      await conn.beginTransaction();

      /* project Table 수정*/
      const updatedProject = await conn.query(`UPDATE project SET ${key.join(", ")} WHERE id = ?`, [...value, projectId]);

      /* stack Table 수정 (delete 후 insert) */
      const deletedSkill = await conn.query(`DELETE FROM stack WHERE projectId = ${projectId}`);

      const [ids, ] = await conn.query(`SELECT id AS skillId FROM skill WHERE name IN ("${skillsList.join('", "')}")`)

      const skillsIds = Object.values(ids);

      for (let i=0; i<skillsIds.length; i++) {
        await conn.query(`INSERT INTO stack (projectId, skillId) VALUES (?, ?)`, [projectId, Object.values(skillsIds[i])])
      }

      conn.commit();

      return updatedProject;
    } else {
      const updatedProject = await db.query(`UPDATE project SET ${key.join(", ")} WHERE id = ?`, [...value, projectId]);

      return updatedProject;
    }
  } catch {
    console.log('프로젝트 생성 실패')
    conn.rollback();
  } finally {
    if (conn) {
      await conn.release();
      console.log("✅ Transaction Finish");
    }
  }
};

// 4-1. 이력서 삭제
// TODO] ON DELETE CASCADE 사용하기, for문
export const deleteResumeQ = async (resumeId: number) => {
  let conn = null;

  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    const [projectIds, ] = await conn.query(`SELECT id AS projectId FROM project WHERE usedResumeId = ?`, resumeId);

    for(let i=0; i<Object.values(projectIds).length; i++){
      const deletedSkill = await conn.query(`DELETE FROM stack WHERE projectId = ${projectIds[i].projectId}`);
    }

    const deletedCareer = await conn.query(`DELETE FROM career WHERE usedResumeId = ?`, resumeId);
    const deletedProject = await conn.query(`DELETE FROM project WHERE usedResumeId = ?`, resumeId);
    const deletedResume = await conn.query(`DELETE FROM resume WHERE id = ?`, resumeId);

    conn.commit();

    return deletedResume;
  } catch {
    conn.rollback();
  } finally {
    if (conn) {
      await conn.release();
      console.log("✅ Transaction Finish");
    }
  }
};

// 4-2. 업무경험 삭제
export const deleteCareerQ = async (careerId: number) => {
  const deletedCareer = await db.query(
    `DELETE
                                        FROM career
                                        WHERE id = ?`,
    careerId
  );

  return deletedCareer;
};

// 4-3. 프로젝트 삭제
export const deleteProjectQ = async (projectId: number) => {
  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    const deletedSkill = await conn.query(`DELETE FROM stack WHERE projectId = ${projectId}`);
    const deletedProject = await conn.query(`DELETE FROM project WHERE id = ?`, projectId);

    conn.commit();

    return deletedProject;
  } catch {
    console.log('프로젝트 삭제 실패')
    conn.rollback();
  } finally {
    conn.release();
  }

};

// skill list 불러오기
export const findSkillsQ = async () => {
  const [skills] = await db.query(`SELECT id AS skillId, name FROM skill`);

  return skills;
};

// skill 생성
export const createSkillQ = async (newSkillName: string) => {
  const newSkill = await db.query(`INSERT INTO skill (name) VALUES (?)`, newSkillName);

  return newSkill;
};
