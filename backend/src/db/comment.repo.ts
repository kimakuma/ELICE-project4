import { db } from "./index.repo";
import * as userRepository from "../db/user.repo";
import * as utils from "./utils/";

// 댓글id로 댓글 검색, 없으면 false
export const findComment = async (commentId: number): Promise<{ id: number } | boolean> => {
  const [comment] = await db.query(
    `
    SELECT id 
    FROM comment
    WHERE id = ?
  `,
    [commentId]
  );
  const parseRow = utils.jsonParse(comment)[0];
  const result = parseRow !== undefined ? parseRow : false;
  return result;
};

// 댓글 좋아요로 포인트 습득
export const savePointByComment = async (data: { userId: number; commentId: number }) => {
  const [keys, values, valval] = utils.insertData(data);
  await db.query(
    `
      INSERT INTO point_from_comment (${keys.join(", ")})
      VALUES (${values.join(", ")})
    `,
    [...valval]
  );

  // 커맨트에서 userId 를 가져옴
  const [commentRows] = await db.query(
    `
    SELECT 
      userId
    FROM comment
    WHERE id = ?
  `,
    [data.commentId]
  );
  const userId = commentRows[0].userId;
  // const [owner] = await db.query(`
  //   SELECT
  //     fromUserId
  //   FROM board
  //   WHERE id = ?
  // `[boardId])
  // const userId = owner[0].id
  // 해당 댓글 주인의 포인트 상승
  await db.query(
    `
      UPDATE user 
      SET 
      point = point+?
      WHERE id= ?
    `,
    [100, userId]
  );
  return true;
};

// 해당 댓글에 좋아요 누른 사람이 저번에도 눌렀는지 확인하는 것
export const findSavedPointByComment = async (userId: number, commentId: number) => {
  const [result] = await db.query(
    `
      SELECT userId
      FROM point_from_comment
      WHERE (userId=? AND commentId=?)
    `,
    [userId, commentId]
  );
  const returnValue = utils.jsonParse(result)[0];
  return returnValue;
};

// 댓글의 좋아요 추가
export const likeCommentFromUser = async (data: Record<number, number>) => {
  const [keys, values, valval] = utils.insertData(data);
  const commentId = valval[1];

  // 트렌젝션으로 묶어야 할 수도 ??
  // 맵핑테이블에 추가

  await db.query(
    `
    INSERT 
    INTO 
    comment_like_maping (${keys.join(", ")})
    VALUES (${values.join(", ")})
    `,
    [...valval]
  );
  // comment테이블 likes 에 +1
  await db.query(
    `
    UPDATE comment 
    SET
      likes= likes + 1
    WHERE id = ?
  `,
    [commentId]
  );
  return true;
};

// 좋아요 취소
export const unlikeCommentFromUser = async (userId: number, commentId: number) => {
  // 매핑테이블에서 해당 유저가 해당댓글에 좋아요 눌렀다는 것을 삭제
  await db.query(
    `
      DELETE
      FROM comment_like_maping
      WHERE (userId = ? AND commentId = ?)
    `,
    [userId, commentId]
  );
  // 해당 댓글의 좋아요를 1 줄임
  await db.query(
    `
    UPDATE comment
    SET likes = likes-1
    WHERE id = ?
  `,
    [commentId]
  );
  return true;
};

// 댓글 좋아요 눌렀는지 확인
export const alreadyLikesComment = async (commentId: number) => {
  const table = await db.query(
    `
      SELECT userId 
      FROM comment_like_maping 
      WHERE(commentId=?)
    `,
    [commentId]
  );

  const overlap = utils.jsonParse(table)[0][0];
  return overlap;
};

// 댓글 달기
export const addCommentQ = async (data: { userId: number; boardId: number; text: string }) => {
  const [keys, values, valval] = utils.insertData(data);
  const boardId = valval[1];
  const [newComment] = await db.query(
    `
    INSERT INTO 
      comment (${keys.join(", ")})
    VALUES (${values.join(", ")})
  `,
    [...valval]
  );
  // 보드 테이블에 댓글수 추가
  await db.query(
    `
    UPDATE board
    SET
      commentCnt = commentCnt+1
    WHERE id =?
  `,
    [boardId]
  );
  const result = utils.jsonParse(newComment);

  return result;
};

// 댓글 지우기  매핑테이블도 지워야함
export const deleteCommentQ = async (userId: number, boardId: number, commentId: number) => {
  const [mapingRows] = await db.query(
    `
      DELETE 
      FROM comment_like_maping 
      WHERE commentId = ?
      `,
    [commentId]
  );
  console.log("매핑테이블에서 삭제");
  await db.query(
    `
      DELETE 
      FROM point_from_comment 
      WHERE commentId = ? AND userId = ?
      `,
    [commentId, userId]
  );
  console.log("포인트테이블에서 삭제");
  const [rows] = await db.query(
    `
    DELETE
    FROM comment
    WHERE (userId = ? AND boardId = ? AND id = ?) 
  `,
    [userId, boardId, commentId]
  );
  console.log("댓글삭제");
  // 해당 댓글에 달렸던 좋아요 데이터 삭제
  await db.query(
    `
    UPDATE board
    SET
    commentCnt = commentCnt-1
    WHERE id = ?
    `,
    [boardId]
  );

  console.log("게시글 댓글카운트 -1");
  const result = utils.jsonParse(rows)[0];
  return result;
};

export const updateCommentQ = async (commentId: number, data: { text: string }): Promise<boolean> => {
  const [keys, values] = utils.updateData(data);
  await db.query(
    `
    UPDATE comment 
    SET ${keys.join(", ")},created=now() 
    WHERE id = ?
    `,
    [...values, commentId]
  );
  return true;
};

export const moreCommentsPagenationQ = async (boardId: number, userId: number, count: number, mark: string) => {
  let [comments] = await db.query(
    `SELECT 
      s.alreadyLikes,
      s.id as commentId, 
      u.username, 
      u.avatarUrl,
      s.text,
      s.created as commentCreated,
      s.likes,
      s.userId as fromUserId,
      s.fixed,
      concat(
        LPAD ((s.likes),12,0),
        LPAD (s.id,8,0)
      ) as MARK
    From board a 
    JOIN comment s 
    ON s.boardId=a.id 
    Join user u 
    On s.userId=u.id 
    WHERE 
      ${mark} > CONCAT (
        LPAD ((s.likes),12,0),
        LPAD (s.id,8,0)
      )
    Order BY  s.likes DESC , s.id DESC
    limit 2
    `,
    [boardId]
  );
  const parseComments = utils.jsonParse(comments);
  const extendedComments = await Promise.all(
    parseComments.map(async (comment) => {
      const [mappingTable] = await db.query(
        `
        SELECT id 
        FROM comment_like_maping 
        WHERE 
            userId = ? 
          AND 
            commentId = ?`,

        [userId, comment.commentId]
      );
      // 현재 사용자의 좋아요 여부
      let parseMappingTable = utils.jsonParse(mappingTable);
      if (parseMappingTable.length <= 0) {
        parseMappingTable = null;
      }
      return {
        ...comment,
        alreadyLikes: parseMappingTable !== null ? true : false,
        // 현재 댓글의 주인인경우
        myComment: comment.fromUserId === userId ? true : false,
      };
    })
  );
  comments = extendedComments;
  const result = utils.jsonParse(comments);
  return result;
};
