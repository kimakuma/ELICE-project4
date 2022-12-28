import { useEffect, useRef, useState } from 'react';
import { theme, Avatar, Space, Progress, Tabs, Modal } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { UserInfo } from 'components/User/UserInfo';
import { Proofread } from 'components/User/Proofread';
import axios from 'axios';
import Layout from 'components/Layout';

const token = localStorage.getItem('accessToken');

//TODO:코드라인이 심각하게 많아지고 있다 컴포넌트의 필요성을 절실하게 느끼는 중..

const tierColors = {
    bronze: '#964b00',
    silver: '#c0c0c0',
    gold: '#ffbd1b',
    platinum: '#005666',
    diamond: '#00a3d2',
    challenger: '#dc143c',
};

const onChange = (key: string) => {
    console.log(key);
};
type Mock = {
    id: string;
    email: string;
    password: string;
    phoneNumber: string;
    point: number;
    username: string;
    created: string;
    avatarUrl: string;
    gitHubUrl: string;
    tierColor: string;
};
const Profile: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [modalText, setModalText] = useState('Content of the modal');
    const [imgUrl, setImgUrl] = useState('');
    const imgLoadRef: any = useRef();
    //TODO: imgUrl update 500 ERR 백엔드와 상의
    const imgFileSend = async (body: any) => {
        try {
            const res = await await axios.post('/file/url', body);
            if (res.status === 200) {
                await axios.patch(
                    '/users/individuals',
                    { avatarUrl: `${res.data.imageUrl}` },
                    { headers: { authorization: `Bearer ${token}` } },
                );
            }
            setImgUrl(res.data.imageUrl);
        } catch (e) {
            console.log(e);
        }
    };
    const showModal = () => {
        setOpen(true);
    };

    const handleOk = (e: any) => {
        const formData1: any = new FormData();
        // const blob = new Blob(, { type: 'image/png' });
        // console.log(blob);

        formData1.append('image', imgLoadRef.current.files[0]);
        setModalText('The modal will be closed after two seconds');
        setConfirmLoading(true);
        setTimeout(() => {
            setOpen(false);
            setConfirmLoading(false);
            imgFileSend(formData1);
            e.target.parentElement.parentElement.parentElement.children[1].children[0].value = '';
            console.log(imgLoadRef.current.files[0]);
        }, 2000);
    };

    const handleCancel = (e: any) => {
        e.target.parentElement.parentElement.parentElement.children[1].children[0].value = '';
        console.log('Clicked cancel button');
        setOpen(false);
    };
    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const [res, setRes] = useState<Mock>({
        id: '',
        email: '',
        password: '',
        phoneNumber: '',
        point: 0,
        username: '',
        created: '',
        avatarUrl: '',
        gitHubUrl: '',
        tierColor: '',
    });
    async function getProfile() {
        try {
            const token = localStorage.getItem('accessToken');

            const mocks = await axios
                .get('/users/individuals', {
                    headers: { authorization: `Bearer ${token}` },
                })
                .then(res => res.data)
                .then(res => res.data);

            console.log(mocks);

            setRes(mocks);
        } catch (e) {
            console.log(e);
        }
    }

    useEffect(() => {
        getProfile();
    }, []);

    const arr = [40, 60, 200, 1000, 10000];
    let upperLimit = arr[0];
    let lowerLimit = 0;
    let tier = 'Bronze';
    let tierColor = tierColors.bronze;

    arr.map((e: number, idx: number): void => {
        if (e <= res.point) {
            upperLimit = arr[idx + 1];
            if (upperLimit === 60) {
                tier = 'Silver';
                tierColor = tierColors.silver;
            } else if (upperLimit === 200) {
                tier = 'Gold';
                tierColor = tierColors.gold;
            } else if (upperLimit === 1000) {
                tier = 'Platinum';
                tierColor = tierColors.platinum;
            } else if (upperLimit === 10000) {
                tier = 'Diamond';
                tierColor = tierColors.diamond;
            } else if (res.point >= 10000) {
                tier = 'Challenger';
                tierColor = tierColors.challenger;
            }
            if (upperLimit === arr[0]) {
                lowerLimit = 0;
            } else {
                if (res.point >= 10000) {
                    lowerLimit = 10000;
                    upperLimit = 10000;
                } else {
                    lowerLimit = arr[idx];
                }
            }
        }
    });
    console.log(upperLimit, lowerLimit);

    let testWidth: number = ((res.point - lowerLimit) / (upperLimit - lowerLimit)) * 100;
    testWidth = Math.floor(testWidth);
    if (testWidth === 100) testWidth = 0;
    if (lowerLimit === 10000) testWidth = 100;
    res.tierColor = tierColor;
    console.log(testWidth);

    return (
        <Layout>
            <div>
                <Space direction="vertical">
                    <div>
                        <Modal
                            title="Title"
                            open={open}
                            onOk={handleOk}
                            confirmLoading={confirmLoading}
                            onCancel={handleCancel}
                            maskClosable={false}
                            keyboard={false}
                            closable={false}
                        >
                            <input type="file" ref={imgLoadRef}></input>
                        </Modal>
                        <Avatar
                            size={120}
                            icon={<UserOutlined />}
                            src={`${imgUrl === '' ? res.avatarUrl : imgUrl}`}
                            style={{ cursor: 'pointer' }}
                            onClick={showModal}
                        />
                    </div>
                    <div style={{ height: '38px' }}>
                        <span style={{ fontSize: '35px' }}>{res.username}</span>
                    </div>
                    <div>
                        <div style={{ width: `${testWidth}%` }}></div>
                    </div>
                    <p
                        style={{
                            color: `${tierColor}`,
                            fontWeight: 'bold',
                            marginLeft: '10px',
                            marginRight: '10px',
                        }}
                    >
                        {tier}
                    </p>
                </Space>
            </div>
            <Progress
                percent={testWidth}
                status="active"
                strokeColor={{ '0%': `${tierColor}`, '100%': `${tierColor}` }}
                style={{
                    fontWeight: 'bold',
                    width: '98%',
                }}
            />
            {/* //TODO: 추후 Tabs 이부분 컴포넌트화 해야함^^ */}
            {upperLimit >= 1000 ? (
                <Tabs
                    tabBarStyle={{
                        color: '#c0c0c0',
                        fontWeight: 'bold',
                        border: 'solid',
                        borderRadius: '6px',
                        borderColor: '#c0c0c0',
                        marginLeft: '10px',
                        marginRight: '10px',
                    }}
                    defaultActiveKey="1"
                    onChange={onChange}
                    items={[
                        {
                            label: `유저정보`,
                            key: '1',
                            children: <UserInfo user={res} getEvent={getProfile}></UserInfo>,
                        },

                        {
                            label: `첨삭`,
                            key: '2',
                            children: <Proofread></Proofread>,
                        },
                    ]}
                />
            ) : (
                <Tabs
                    defaultActiveKey="1"
                    onChange={onChange}
                    items={[
                        {
                            label: `유저정보`,
                            key: '1',
                            children: <UserInfo user={res} getEvent={getProfile}></UserInfo>,
                        },

                        {
                            label: `첨삭(플레티넘 이상)`,
                            key: '2',
                            children: <Proofread></Proofread>,
                            disabled: true,
                        },
                    ]}
                    tabBarStyle={{
                        color: '#c0c0c0',
                        fontWeight: 'bold',
                        border: 'solid',
                        borderRadius: '6px',
                        borderColor: '#c0c0c0',
                        marginLeft: '10px',
                        marginRight: '10px',
                    }}
                />
            )}
        </Layout>
    );
};

export default Profile;
