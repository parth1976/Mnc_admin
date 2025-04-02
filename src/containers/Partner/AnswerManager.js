import React, { useState, useEffect } from 'react';
import {
    Card,
    List,
    Tag,
    Button,
    message,
    Checkbox,
    Popconfirm,
    Divider,
    Drawer,
    Modal,
    Input
} from 'antd';
import {
    DragOutlined,
    DeleteOutlined,
    ArrowRightOutlined,
    ArrowLeftOutlined,
    PlusOutlined
} from '@ant-design/icons';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { BASE_URL } from '../../constanats';
import { callAPI } from '../../utils/api';

const AnswerManager = ({ questionId, answerDrawer, setAnswerDrawer }) => {
    const [mainAnswers, setMainAnswers] = useState([]);
    const [tempAnswers, setTempAnswers] = useState([]);
    const [selectedMain, setSelectedMain] = useState([]);
    const [selectedTemp, setSelectedTemp] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('main'); // 'main' or 'temp'
    const [newAnswers, setNewAnswers] = useState(['']);

    const addAnswers = async () => {
        if (newAnswers.length === 0) {
            message.warning('Please add at least one answer');
            return;
        }

        try {
            setLoading(true);
            const data = {
                questionId,
                answers: newAnswers,
            };
            if (modalType === 'temp') {
                data.priority = 'medium'
            }
            const endpoint =
                modalType === 'main'
                    ? `${BASE_URL}/admin/firstGame/questions/add-to-main`
                    : `${BASE_URL}/admin/firstGame/questions/add-to-temp`;

            callAPI('POST', endpoint, data).then((res) => {
                if (res) {
                    message.success(`Added ${newAnswers.length} answer(s) to ${modalType}`);
                    fetchAnswers();
                    setIsModalOpen(false);
                    setNewAnswers(['']);
                }
            });
        } catch (error) {
            message.error('Failed to add answers');
        } finally {
            setLoading(false);
        }
    };

    const openModal = (type) => {
        setModalType(type);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setNewAnswers(['']);
    };

    const handleAddNewAnswer = () => {
        setNewAnswers([...newAnswers, '']);
    };

    const handleRemoveAnswer = (index) => {
        setNewAnswers(newAnswers.filter((_, i) => i !== index));
    };

    const handleAnswerChange = (value, index) => {
        const updatedAnswers = [...newAnswers];
        updatedAnswers[index] = value;
        setNewAnswers(updatedAnswers);
    };

    useEffect(() => {
        fetchAnswers();
    }, [questionId]);

    const fetchAnswers = async () => {
        try {
            setLoading(true);
            callAPI('GET', `${BASE_URL}/admin/firstGame/questions/getQuestionById/${questionId}`).then((res) => {
                if (res) {
                    setMainAnswers(res.question?.answer || []);
                }
            })
            callAPI('GET', `${BASE_URL}/admin/firstGame/questions/tempAnswers/${questionId}`).then((res) => {
                if (res) {
                    setTempAnswers(res.question?.answer || []);
                }
            })

            // setTempAnswers(tempRes.data.answers || []);
        } catch (error) {
            message.error('Failed to fetch answers');
        } finally {
            setLoading(false);
        }
    };

    // Updated to handle multiple answers
    const moveToTemp = async (answers) => {
        if (!answers || answers.length === 0) return;

        try {
            setLoading(true);
            const data = {
                questionId,
                answers: Array.isArray(answers) ? answers : [answers],
                priority: 'medium' // default priority
            }
            callAPI('POST', `${BASE_URL}/admin/firstGame/questions/move-to-temp`, data).then((res) => {
                if (res) {
                    message.success(`Moved ${answers.length} answer(s) to temp`);
                    fetchAnswers();
                    setSelectedMain([]);
                }
            })
        } catch (error) {
            message.error('Failed to move answers');
            setLoading(false);
        }
    };

    // Updated to handle multiple answers
    const moveToMain = async (answers) => {
        if (!answers || answers.length === 0) return;

        try {
            setLoading(true);
            const data = {
                questionId,
                answers: Array.isArray(answers) ? answers : [answers]
            }
            callAPI('POST', `${BASE_URL}/admin/firstGame/questions/move-to-main`, data).then((res) => {
                if (res) {
                    message.success(`Moved ${answers.length} answer(s) to main`);
                    fetchAnswers();
                    setSelectedTemp([]);
                }
            })
        } catch (error) {
            message.error('Failed to move answers');
            setLoading(false);
        }
    };

    // Delete multiple temp answers
    const deleteTempAnswers = async (answers) => {
        if (!answers || answers.length === 0) return;

        try {
            setLoading(true);
            callAPI('DELETE', `${BASE_URL}/admin/firstGame/questions/tempAnswers`, {
                questionId,
                answers: Array.isArray(answers) ? answers : [answers]
            }).then((res) => {
                if (res) {
                    message.success(`Deleted ${answers.length} answer(s)`);
                    fetchAnswers();
                    setSelectedTemp([]);
                }
            })
        } catch (error) {
            message.error('Failed to delete answers');
            setLoading(false);
        }
    };

    const handleMainSelect = (answer, checked) => {
        if (checked) {
            setSelectedMain([...selectedMain, answer]);
        } else {
            setSelectedMain(selectedMain.filter(a => a !== answer));
        }
    };

    const handleTempSelect = (answer, checked) => {
        if (checked) {
            setSelectedTemp([...selectedTemp, answer.answer]);
        } else {
            setSelectedTemp(selectedTemp.filter(a => a !== answer.answer));
        }
    };

    const handleDropToMain = (item) => {
        if (item.type === 'temp') {
            moveToMain([item?.answer?.answer]);
        }
    };

    const handleDropToTemp = (item) => {
        if (item.type === 'main') {
            moveToTemp([item.answer]);
        }
    };

    const AnswerItem = ({ answer, type, onDrop, onSelect, isSelected }) => {
        const [{ isDragging }, drag] = useDrag({
            type,
            item: { answer, type },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        });

        const [{ isOver }, drop] = useDrop({
            accept: type === 'main' ? 'temp' : 'main',
            drop: (item) => onDrop(item),
            collect: (monitor) => ({
                isOver: monitor.isOver(),
            }),
        });

        const opacity = isDragging ? 0.4 : 1;
        const backgroundColor = isOver ? '#f0f0f0' : 'transparent';

        return (
            <div ref={drop}>
                <div
                    ref={drag}
                    style={{
                        opacity,
                        backgroundColor,
                        padding: '8px',
                        margin: '4px 0',
                        border: '1px solid #d9d9d9',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    <DragOutlined style={{ marginRight: 8, cursor: 'move' }} />
                    <Checkbox
                        checked={isSelected}
                        onChange={(e) => onSelect(answer, e.target.checked)}
                        style={{ marginRight: 8 }}
                    />
                    {type === 'temp' ? (
                        <>
                            <span style={{ flex: 1 }}>{answer.answer}</span>
                            <Tag color={answer.priority === 'high' ? 'red' : answer.priority === 'medium' ? 'orange' : 'green'}>
                                {answer.priority}
                            </Tag>
                        </>
                    ) : (
                        <span style={{ flex: 1 }}>{answer}</span>
                    )}
                </div>
            </div>
        );
    };

    return (
        <>
            <Drawer
                title="Answer Mapper"
                width={1200}
                open={answerDrawer}
                onClose={() => setAnswerDrawer(false)}
                bodyStyle={{ padding: 0, overflow: 'hidden' }}

            >
                <DndProvider backend={HTML5Backend}>
                    <div style={{
                        display: 'flex', gap: 16,
                        height: 'calc(100vh - 55px)', // Subtract drawer header height
                        padding: '16px'
                    }}>
                        <Card
                            title={`Main Answers (${mainAnswers.length})`}
                            style={{ flex: 1 }}
                            loading={loading}
                            bodyStyle={{
                                padding: '16px',
                                height: 'calc(100% - 56px)', // Subtract card header height
                                overflow: 'auto'
                            }}
                            extra={
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={() => openModal('main')}
                                    >
                                        Answer
                                    </Button>
                                    {selectedMain.length > 0 && (
                                        <Button
                                            type="primary"
                                            icon={<ArrowRightOutlined />}
                                            onClick={() => moveToTemp(selectedMain)}
                                            disabled={selectedMain.length === 0}
                                        >
                                            Move to Temp ({selectedMain.length})
                                        </Button>
                                    )}
                                    <Checkbox
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedMain(mainAnswers);
                                            } else {
                                                setSelectedMain([]);
                                            }
                                        }}
                                        checked={selectedMain.length === mainAnswers.length && mainAnswers.length > 0}
                                        indeterminate={selectedMain.length > 0 && selectedMain.length < mainAnswers.length}
                                    >
                                        Select All
                                    </Checkbox>
                                </div>
                            }
                        >
                            {mainAnswers.length === 0 && (
                                <div style={{ padding: 16, textAlign: 'center', color: 'rgba(0, 0, 0, 0.45)' }}>
                                    No answers in main collection
                                </div>
                            )}
                            <List
                                dataSource={mainAnswers}
                                renderItem={(answer) => (
                                    <AnswerItem
                                        answer={answer}
                                        type="main"
                                        onDrop={handleDropToMain}
                                        onSelect={handleMainSelect}
                                        isSelected={selectedMain.includes(answer)}
                                    />
                                )}
                            />
                        </Card>

                        <Card
                            title={`Temp Answers (${tempAnswers.length})`}
                            style={{ flex: 1 }}
                            loading={loading}
                            bodyStyle={{
                                padding: '16px',
                                height: 'calc(100% - 56px)', // Subtract card header height
                                overflow: 'auto'
                            }}
                            extra={
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={() => openModal('temp')}
                                    >
                                        Answer
                                    </Button>
                                    {selectedTemp.length > 0 && (
                                        <>
                                            <Button
                                                type="primary"
                                                icon={<ArrowLeftOutlined />}
                                                onClick={() => moveToMain(selectedTemp)}
                                                disabled={selectedTemp.length === 0}
                                            >
                                                Move to Main ({selectedTemp.length})
                                            </Button>
                                            <Popconfirm
                                                title={`Delete ${selectedTemp.length} selected answer(s)?`}
                                                onConfirm={() => deleteTempAnswers(selectedTemp)}
                                                okText="Yes"
                                                cancelText="No"
                                            >
                                                <Button danger icon={<DeleteOutlined />}>
                                                    ({selectedTemp.length})
                                                </Button>
                                            </Popconfirm>
                                        </>
                                    )}
                                    <Checkbox
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedTemp(tempAnswers.map((a) => a.answer));
                                            } else {
                                                setSelectedTemp([]);
                                            }
                                        }}
                                        checked={selectedTemp.length === tempAnswers.length && tempAnswers.length > 0}
                                        indeterminate={selectedTemp.length > 0 && selectedTemp.length < tempAnswers.length}
                                    >
                                        Select All
                                    </Checkbox>

                                </div>
                            }
                        >
                            {tempAnswers.length === 0 && (
                                <div style={{ padding: 16, textAlign: 'center', color: 'rgba(0, 0, 0, 0.45)' }}>
                                    No answers in temp collection
                                </div>
                            )}
                            <List
                                dataSource={tempAnswers}
                                renderItem={(answer) => (
                                    <AnswerItem
                                        answer={answer}
                                        type="temp"
                                        onDrop={handleDropToTemp}
                                        onSelect={handleTempSelect}
                                        isSelected={selectedTemp.includes(answer.answer)}
                                    />
                                )}
                            />
                        </Card>
                    </div>
                </DndProvider>
            </Drawer>
            <Modal
                title={`Add ${modalType === 'main' ? 'Main' : 'Temp'} Answers`}
                open={isModalOpen}
                onCancel={closeModal}
                onOk={addAnswers}
                okText="Add"
                cancelText="Cancel"
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {newAnswers.map((answer, index) => (
                        <div key={index} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <Input
                                placeholder="Enter answer"
                                value={answer}
                                onChange={(e) => handleAnswerChange(e.target.value, index)}
                                style={{ flex: 1 }}
                            />
                            <Button
                                icon={<PlusOutlined />}
                                onClick={handleAddNewAnswer}
                            />
                            <Button
                                disabled={newAnswers.length === 1}
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => handleRemoveAnswer(index)}
                            />
                        </div>
                    ))}
                </div>
            </Modal>
        </>
    );
};

export default AnswerManager;