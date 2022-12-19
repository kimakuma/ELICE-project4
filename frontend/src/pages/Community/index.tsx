import React, { useState, useEffect } from "react";
import * as S from "./style";

type resultType = {
  isConnect: boolean;
  postList: never[]; //땜빵
  isLastPage: boolean;
};

function fakeLoadItem(
  filter: string,
  count: number,
  pageNum: number = 1
): resultType {
  const jsonData = require("./fake.json");

  return {
    isConnect: true,
    postList: jsonData.slice(0, count),
    isLastPage: false,
  };
}

function Community() {
  return (
    <div>
      {/*검색창?*/}
      {/*필터*/}
      {/*리스트*/}
      <FilterPostListContainer filter="like" />
      <FilterPostListContainer filter="comment" />
      <FilterPostListContainer filter="view" />
      <FreePostListContainer />
    </div>
  );
}
//https://medium.com/hivelab-dev/react-js-tutorial-exam-step1-bfec609f5652
//http://61.107.76.13/Li/04_25.html
//https://slog.website/post/8
//https://react.vlpt.us/basic/12-variable-with-useRef.html
//https://swimfm.tistory.com/entry/%EC%8A%A4%ED%81%AC%EB%A1%A4-%EB%82%B4%EB%A6%AC%EB%A9%B4-%EC%83%81%EB%8B%A8%EC%97%90-%EA%B3%A0%EC%A0%95%EB%90%98%EB%8A%94-%EB%84%A4%EB%B9%84-%EB%A9%94%EB%89%B4-%EB%A7%8C%EB%93%A4%EA%B8%B0
// 1. 불러오기
// 2. 리스트
// 3. 그리드
// 4. 페이지네이션
// 5. 필터

// 정리하고 마일스톤에 올리기?

type objectType = { [key: string]: any };

const FILTER_STRING: objectType = {
  like: "좋아요 많은 게시물",
  comment: "댓글 많은 게시물",
  view: "조회수 많은 게시물",
  new: "자유 주제 게시물",
};

function FilterPostListContainer({ filter }: objectType) {
  const { isConnect, postList, isLastPage } = fakeLoadItem(filter, 1);
  return (
    <div>
      <h2>{FILTER_STRING[filter]}</h2>
      <button type="button">더 보기</button>
      <ul>
        {postList.map((i: objectType) => (
          <PostItem post={i} key={i["post_id"]} />
        ))}
      </ul>
    </div>
  );
}

function FreePostListContainer() {
  const [postListState, setPostListState] = useState([]);
  const [pageNum, setPageNum] = useState(1);
  const [isLastPageState, setIsLastPageState] = useState(true);

  useEffect(() => {
    const { isConnect, postList, isLastPage } = fakeLoadItem(
      "new",
      12,
      pageNum
    );
    setPostListState([...postListState, ...postList]);
    setIsLastPageState(isLastPage);
  }, [pageNum]);

  return (
    <div>
      <h2>{FILTER_STRING["new"]}</h2>
      <button type="button">더 보기</button>
      <ul>
        페이지 넘버 : {pageNum}
        {postListState.map((i: objectType) => (
          <PostItem post={i} key={i["post_id"]} />
        ))}
      </ul>
      {isLastPageState ? (
        ""
      ) : (
        <button type="button" onClick={() => setPageNum(pageNum + 1)}>
          더보기
        </button>
      )}
    </div>
  );
}

function PostItem({ post }: objectType) {
  return (
    <S.PostLI>
      <h3>{post["post_title"]}</h3>
    </S.PostLI>
  );
}

export default Community;