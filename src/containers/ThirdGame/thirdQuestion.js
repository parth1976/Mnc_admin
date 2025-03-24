import React, { useState, useEffect } from "react";
import { Drawer, Table, Button, Modal, Form, Row, Col, Input, InputNumber, Card } from "antd";
import axios from "axios";
import { callAPI } from "../../utils/api";
import { BASE_URL } from "../../constanats";
import { F_DeleteIcon, F_EditIcon } from "../../Icons";
import moment from "moment";
import { notify } from "../../utils/localServiceUtil";
import { useForm } from "antd/es/form/Form";
import TextArea from "antd/es/input/TextArea";
const defaultRoles = [
    {
      role: "CEO",
      About_Role: "",
      Problem: "",
    },
    {
      role: "CFO",
      About_Role: "",
      Problem: "",
    },
    {
      role: "CHRO",
      About_Role: "",
      Problem: "",
    },
    {
      role: "CIO",
      About_Role: "",
      Problem: "",
    },
    {
      role: "COO",
      About_Role: "",
      Problem: "",
    },
    {
      role: "CDO",
      About_Role: "",
      Problem: "",
    }
  ];
  
const DataDrawer = ({ selecteddata, visible, setIsVisible }) => {
    console.log("selectedData", selecteddata);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedId, setSelectedId] = useState(false);
    const [form] = useForm();

    useEffect(() => {
        selecteddata ? form.setFieldsValue({ ...selecteddata }) : form.setFieldsValue({ Roledetails : defaultRoles , Situation : '' });
    }, [selecteddata]);

    console.log("form", form.getFieldsValue());

    const onClose = () => {
        form.resetFields();
        setIsVisible(false)
    }
    

    const handleDeleteQuestion = () => {
        callAPI("DELETE", `${BASE_URL}/admin/secondGame/questions/deleteQuestions`, { ids: [selectedId] })
            .then((res) => {
                    setDeleteConfirm(false);
                    notify("success", res?.message)
            })
            .catch((err) => {
                notify("error", err?.message)
            });
    }

    const handleCreateQuestion = (values) => {
        const url = selecteddata ? `/admin/thirdGame/questions/updateQuestion/${selecteddata?._id}` : `/admin/thirdGame/questions/create`
        callAPI("POST", `${BASE_URL}${url}`, { ...values })
            .then((res) => {
                    notify("success", res?.message)
                    onClose();
            })
            .catch((err) => {
                notify("error", err?.message)
            });
    }

    return (
        <React.Fragment>
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
            {visible && <Modal
                title={selectedId ? "Edit Question" : "Add Question"}
                okText="Save"
                width="700px"
                open={visible}
                cancelText="Cancel"
                onCancel={() => { onClose(); }}
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
            <div style={{ maxHeight: '65vh', overflowY: 'auto', paddingRight: '10px' }}>
                <Form layout="vertical" size='large' form={form}>
                    <Row gutter={10}>
                        <Col span={24}>
                            <Form.Item
                                name='Situation'
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
                        {(form.getFieldValue('Roledetails') ? form.getFieldValue('Roledetails') : defaultRoles).map((item, index) => (
                            <Col span={24} key={item._id}>
                                    <Row gutter={16}>
                                        <Col span={24}>
                                            <Form.Item
                                                name={['Roledetails', index, 'role']}
                                                label="Role"
                                                initialValue={item.role}
                                            >
                                                <Input disabled />
                                            </Form.Item>
                                        </Col>
                                        <Col span={24}>
                                            <Form.Item
                                                name={['Roledetails', index, 'About_Role']}
                                                label="About Role"
                                                initialValue={item.About_Role}
                                                rules={[
                                                    { required: true, message: 'Please enter about role' },
                                                ]}
                                            >
                                                <TextArea rows={3} placeholder="Enter about role" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={24}>
                                            <Form.Item
                                                name={['Roledetails', index, 'Problem']}
                                                label="Problem"
                                                initialValue={item.Problem}
                                                rules={[
                                                    { required: true, message: 'Please enter problem' },
                                                ]}
                                            >
                                                <TextArea rows={3} placeholder="Enter problem" />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                            </Col>
                        ))}
                    </Row>
                </Form>
                </div>
            </Modal>}
        </React.Fragment>

    );
};

export default DataDrawer;
