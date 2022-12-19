import { Layout, Alert } from './style';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Mock = { name: string; address: string; updatedAt: string; id: any };

const ResumeMain = () => {
    const [res, setRes] = useState<Mock[]>([]);
    const navigate = useNavigate();
    // /my-portfolio/resumes/:resumeId
    async function deletePortfolio(e: any) {
        console.log(e.target.value);
        try {
            await axios.delete(`/my-portfolio/resumes/${e.target.value}`);
        } catch (e) {
            console.log(e);
        }
    }
    async function getPortfolio() {
        try {
            const token = localStorage.getItem('accessToken');
            // const res = await axios.post(
            //   "https://reactproject-test-78fcd-default-rtdb.firebaseio.com/mock.json",
            //   { mocksPortfolio }
            // );
            const mocks = await axios
                .get('/myportfolio/list', {
                    headers: { authorization: `Bearer ${token}` },
                })
                .then(res => res.data)
                .then(res => res.data);
            console.log(mocks, 'SUCCCCCCCCCess');

            await setRes(mocks);

            // console.log(mocks.data["-NJJR5a9003Z0Qw6WOzB"]);
            // const mock = mocks.data["-NJJR5a9003Z0Qw6WOzB"].mocksPortfolio;
            // setRes(mock);
        } catch (e) {
            console.log(e);
        }
    }
    async function postPortfolio() {
        try {
            const token = localStorage.getItem('accessToken');
            // const res = await axios.post(
            //   "https://reactproject-test-78fcd-default-rtdb.firebaseio.com/mock.json",
            //   { mocksPortfolio }
            // );
            const mocks = await axios.post(
                '/myportfolio/resume',
                {},
                { headers: { authorization: `Bearer ${token}` } },
            );

            const id = mocks.data.createdResumeId;

            if (mocks.status === 200) {
                navigate(`/resume/${id}`);
            }
            console.log(mocks);
        } catch (e) {
            console.log(e);
        }
    }

    useEffect(() => {
        getPortfolio();
    }, []);

    return (
        <>
            <h1>My Portfolio</h1>
            <Layout>
                <div onClick={postPortfolio}>
                    <div>
                        <div>
                            <i>+</i>
                        </div>
                        <p>새 이력서 작성</p>
                    </div>
                </div>

                {res.map((e: Mock) => (
                    <div key={e.id}>
                        <h3>{e.name}</h3>
                        <p>{e.updatedAt.split('T')[0]}</p>
                        <button value={e.id} onClick={deletePortfolio}>
                            삭제
                        </button>
                    </div>
                ))}
            </Layout>
            <Alert>{res.length === 0 && <p>작성된 이력서가 없습니다.</p>}</Alert>
        </>
    );
};

export default ResumeMain;