import React, { useState, useEffect } from "react";
import { Drawer, Table, Button, Modal, Form, Row, Col, Input, InputNumber } from "antd";
import axios from "axios";
import { callAPI } from "../../utils/api";
import { BASE_URL } from "../../constanats";
import { F_DeleteIcon, F_EditIcon } from "../../Icons";
import moment from "moment";
import { notify } from "../../utils/localServiceUtil";
import { useForm } from "antd/es/form/Form";
const DEFAULT_OPTIONS = ["", "", "", ""];
const DEFAULT_SCORES = [0, 0, 0, 0];
const DataDrawer = ({ selecteddata, visible, onClose }) => {
    console.log("selectedData" , selecteddata);
    
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedId, setSelectedId] = useState(false);
    const [form] = useForm();

    const handleDeleteQuestion = () => {
        callAPI("DELETE", `${BASE_URL}/admin/secondGame/questions/deleteQuestions`, { ids: [selectedId] })
            .then((res) => {
                if (res) {
                    setDeleteConfirm(false);
                    notify("success", res?.message)
                }
            })
            .catch((err) => {
                notify("error", err?.message)
            });
    }

    const handleCreateQuestion = (values) => {
        console.log("values" , values);
        const url = selectedId ? `/admin/secondGame/questions/updateQuestion/${selectedId}` : `/admin/secondGame/questions/create`
        callAPI("POST", `${BASE_URL}${url}`, { ...values })
            .then((res) => {
                if (res) {
                    setIsOpen(false);
                    notify("success", res?.message)
                    setSelectedId('');
                    form.resetFields();
                }
            })
            .catch((err) => {
                notify("error", err?.message)
            });
    }

    const columns = [
        {
            title: 'Sr. No.',
            id: "row",
            key: "row",
            dataIndex: 'key',
            width: "5%",
            render: (x, props, index) => (
                <span>{index + 1}</span>
            )
        },
        { title: "Role", dataIndex: "role", key: "question" },
        { title: "Problem", dataIndex: "Problem", key: "question" },
        {
            id: "action",
            key: "action",
            width: "7%",
            title:
                (
                    <span>Action</span>
                ),
            render: (x, props, index) => {
                return (
                    <React.Fragment>

                        <div className='f_flex f_align-center f_content-center'>
                            <span
                                onClick={(e) => {
                                    e.preventDefault();
                                    setSelectedId(props._id);
                                    setIsOpen(true);
                                    form.setFieldsValue({ questionText: props.questionText, options: props.options, scores: props.scores });
                                }}
                                className="f_cp f_icon-small-hover f_flex f_align-center f_content-center">
                                <F_EditIcon width='14px' height='14px' />
                            </span>
                            <span
                                className="f_cp f_icon-small-hover f_icon-small-hover-delete f_flex f_align-center f_content-center f_ml-5"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedId(props._id);
                                    setDeleteConfirm(true);
                                }}
                            >
                                <F_DeleteIcon width="15px" height="15px" />
                            </span>
                        </div>
                    </React.Fragment >
                );
            },
        }
    ];

    return (
        <React.Fragment>
            <Drawer
                title="Questions"
                width={1000}
                open={visible}
                onClose={onClose}
                extra={
                    <Button type="primary" onClick={() => { setIsOpen(true) }}>
                        Create
                    </Button>
                }
            >
                <Table columns={columns} dataSource={selecteddata?.Roledetails} loading={loading} rowKey="id" pagination={false} />
            </Drawer>
            <Modal
                open={deleteConfirm}
                footer={null}
                title="Delete"
                onCancel={() => setDeleteConfirm(false)}
                className="f_delete-confirm"
            >
                <div className="f_flex f_flex-col">
                    <p className="f_text-left f_fs-14 f_mb-10">
                        {" "}
                        Are you sure you want to remove the lead/s?
                    </p>
                    <div className="f_flex f_align-center f_content-end">
                        {" "}
                        <Button onClick={() => setDeleteConfirm(false)}>Cancel</Button>{" "}
                        <Button
                            className="f_ml-10"
                            onClick={() => handleDeleteQuestion()}
                            danger
                            type="primary"
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>
            {isOpen && <Modal
                title={selectedId ? "Edit Question" : "Add Question"}
                okText="Save"
                width="700px"
                open={isOpen}
                cancelText="Cancel"
                onCancel={() => { setIsOpen(false); form.resetFields(); setSelectedId('') }}
                onOk={(e) => {
                    form
                        .validateFields()
                        .then((values) => {
                            handleCreateQuestion(values);
                        })
                        .catch((info) => {
                            console.log('Validation Failed:', info);
                        });
                }}
            >
                <Form layout="vertical" size='large' form={form}>
                    <Row gutter={10}>
                        <Col span={24}>
                            <Form.Item
                                name='questionText'
                                label='Question'
                                rules={[
                                    {
                                        required: true,
                                        type: 'string',
                                        message: 'Please enter Question'
                                    }
                                ]}
                            >
                                <Input.TextArea placeholder='Enter Message' autoComplete='off' autoFocus />
                            </Form.Item>
                        </Col>
                        {(form.getFieldValue('options')?.length ? form.getFieldValue('options') : DEFAULT_OPTIONS)?.map((item, index) => (
                            <Col span={12} key={index}>
                                <Form.Item
                                    name={['options', index]} // Dynamic indexing for each option
                                    label={`Option ${index + 1}`}
                                    rules={[
                                        {
                                            required: true,
                                            type: 'string',
                                            message: 'Please enter an option'
                                        }
                                    ]}
                                >
                                    <Input
                                        placeholder='Enter Message'
                                        autoComplete='off'
                                    />
                                </Form.Item>
                            </Col>
                        ))}
                        {(form.getFieldValue('scores')?.length ? form.getFieldValue('scores') : DEFAULT_OPTIONS)?.map((item, index) => (
                            <Col span={6} key={index}>
                                <Form.Item
                                    name={['scores', index]} // Dynamic indexing for each option
                                    label={`score ${index + 1}`}
                                    rules={[
                                        {
                                            required: true,
                                            type: 'number',
                                            message: 'Please enter an score'
                                        }
                                    ]}
                                >
                                    <InputNumber
                                        placeholder='Enter Message'
                                        autoComplete='off'
                                        type="number"
                                        min={0}
                                        max={10}
                                    />
                                </Form.Item>
                            </Col>
                        ))}
                    </Row>
                </Form>
            </Modal>}
        </React.Fragment>

    );
};

export default DataDrawer;
