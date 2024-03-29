import React from 'react';
import { Card, List, Switch } from 'antd';
const data = [
    {
        title: 'Title 1',
    },
    {
        title: 'Title 2',
    },
    {
        title: 'Title 3',
    },
    {
        title: 'Title 4',
    },
    {
        title: 'Title 5',
    },
    {
        title: 'Title 6',
    },
    {
        title: 'Title 6',
    },
    {
        title: 'Title 6',
    },
];
export const Proofread = () => {
    return (
        <div
            style={{
                marginLeft: '20px',
                marginRight: '20px',
                height: '80%',
                marginBottom: '20px',
            }}
        >
            <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'row-reverse' }}>
                <Switch defaultChecked />
            </div>
            <List
                grid={{
                    gutter: 16,
                    xs: 1,
                    sm: 2,
                    md: 4,
                    lg: 4,
                    xl: 6,
                    xxl: 3,
                }}
                dataSource={data}
                renderItem={item => (
                    <List.Item>
                        <Card
                            style={{
                                cursor: 'pointer',
                                border: ' solid #dbdbdb',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                            }}
                            title={item.title}
                        >
                            Card content
                        </Card>
                    </List.Item>
                )}
            />
        </div>
    );
};
