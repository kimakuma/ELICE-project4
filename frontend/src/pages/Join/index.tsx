import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as S from './style';
import Logo from 'assets/images/logo.png';
import { useForm } from 'react-hook-form';

const Join = () => {
    const [email, setEmail] = useState();
    const [code, setCode] = useState();
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<FormData>();

    interface FormData {
        id: string;
        password: string;
        name: string;
        phone: string;
        email: string;
        code: number;
        passwordCheck: string;
    }

    const onValid = async (data: FormData) => {
        if (data.password !== data.passwordCheck) {
            setError('passwordCheck', { message: '비밀번호가 일치하지 않습니다.' });
        }

        const jsondata = {
            email: data.email,
            password: data.password,
            username: data.name,
            phoneNumber: data.phone,
        };

        try {
            console.log('data', jsondata);
            const res = await axios.post('/users/individuals', jsondata);
            console.log(res, '성공');

            alert('회원가입이 완료되었습니다.');
            navigate('/login');
        } catch (err: any) {
            console.error(err.stack);
            if (err.response.status === 400) {
                console.log('400 Error');
                alert('이미 가입한 이메일 입니다.');
            }
        }
    };

    const onChange = (e: any) => {
        setEmail(e.target.value);
    };

    const sendEmail = async (e: any) => {
        e.preventDefault();
        const jsondata = {
            email,
        };

        try {
            const res = await axios.post('/users/email', jsondata);
            console.log(res, '성공');
            alert('이메일을 확인 해 주세요');
        } catch (err: any) {
            console.error(err.stack);
        }
    };

    const emailAuth = async (e: any) => {
        e.preventDefault();
        const jsondata = {
            email: email,
            code: Number(code),
        };

        console.log('data', jsondata);

        try {
            const res = await axios.post('/users/email/auth', jsondata);
            console.log(res, '성공');

            const reqConfirm = res.data.msg;

            sessionStorage.setItem('reqConfirm', reqConfirm);
            sessionStorage.setItem('email', res.data.email);
            alert('인증 완료');
        } catch (err: any) {
            console.error(err.stack);
        }
    };

    return (
        <S.Div>
            <S.MobileDiv>
                <div>
                    <article>
                        <Link to="/">
                            {' '}
                            <S.Image src={Logo} alt="로고" />
                        </Link>
                    </article>
                </div>
                <form onSubmit={handleSubmit(onValid)} autoComplete="off">
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            width: '400px',
                            minWidth: '320px',
                            textAlign: 'center',
                            paddingBottom: '30px',
                        }}
                    >
                        <h1>회원가입</h1>
                        <p>이메일</p>
                        <input
                            {...register('email', {
                                required: '이메일을 입력해주세요',
                                pattern: {
                                    value: /^[A-Za-z0-9._%+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
                                    message: '이메일 형식만 가능합니다.',
                                },
                            })}
                            placeholder="이메일 입력"
                            autoComplete="off"
                            value={email}
                            onChange={onChange}
                        />
                        <label>{errors?.email?.message}</label>
                        {/* <label>아무말</label> */}
                        <button style={{ marginTop: '10px' }} onClick={sendEmail}>
                            인증번호 보내기
                        </button>
                        <div style={{ display: 'flex', textAlign: 'left' }}>
                            <input
                                placeholder="인증번호를 입력해주세요"
                                {...register('code')}
                                value={code}
                                onChange={(e: any) => {
                                    setCode(e.target.value);
                                }}
                            ></input>
                            <button onClick={emailAuth}>인증하기</button>
                        </div>
                        <p>비밀번호</p>
                        <input
                            {...register('password', {
                                required: '비밀번호를 입력해주세요',
                                minLength: {
                                    value: 5,
                                    message: '비밀번호는 최소 5자리 이상 입력해주세요',
                                },
                            })}
                            type="password"
                            placeholder="비밀번호 입력"
                            autoComplete="new-password"
                        />
                        <label>{errors?.password?.message}</label>
                        <p>비밀번호 확인</p>
                        <input
                            type="password"
                            placeholder="비밀번호 확인"
                            {...register('passwordCheck', {
                                required: '비밀번호를 입력해주세요 ',
                                minLength: {
                                    value: 5,
                                    message: '비밀번호는 최소 5자리 이상 입력해주세요',
                                },
                            })}
                        />
                        <label>{errors?.passwordCheck?.message}</label>
                        <p>이름</p>
                        <input
                            {...register('name', {
                                required: '비밀번호를 입력해주세요 ',
                            })}
                            placeholder="이름 입력"
                        />
                        <p>휴대폰</p>
                        <input
                            {...register('phone', {
                                required: '비밀번호를 입력해주세요 ',
                            })}
                            placeholder="- 빼고 입력해주세요"
                            maxLength={13}
                        />
                        <button formAction="">회원가입</button>
                        <Link
                            to="/login"
                            style={{
                                textDecoration: 'none',
                                color: 'black',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                marginTop: '10px',
                            }}
                        >
                            로그인{' '}
                        </Link>
                    </div>
                </form>
            </S.MobileDiv>
        </S.Div>
    );
};

export default Join;
