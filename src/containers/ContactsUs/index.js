import React, { useEffect, useState } from 'react'
import { Input, Button, Tooltip, Table, Pagination, Modal, Row, Form, Col } from "antd";
import { F_DeleteIcon, F_DownloadExcelIcon, F_DownloadPdfIcon, F_EditIcon, F_PlusIcon } from "../../Icons";
import { callAPI } from '../../utils/api';
import { BASE_URL, TOKEN_KEY } from '../../constanats';
import UtilLocalService, { notify } from '../../utils/localServiceUtil';
import axios from 'axios';

const ContactsUs = () => {
  const [finalHeight, setFinalHeight] = useState("");
  const [visibleModal, setIsVisibleModal] = useState(false);
  const [selctedId, setSelectedId] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [filter, setFilter] = useState({
    page: 1,
    limit: 20,
  })
  const [pageLimit, setPageLimit] = React.useState(20);
  const [totalPages, settotalPages] = React.useState(0);
  const [form] = Form.useForm();
  useEffect(() => {
    let mainLayoutHeader = document.getElementById("f_layout-content-header");
    let mainContentHeader = document.querySelector(".f_content-main-header");
    let paginationHeight = document.querySelector(".f_content-main-pagination");
    let mainHeight = mainLayoutHeader?.offsetHeight + mainContentHeader?.offsetHeight + paginationHeight?.offsetHeight;
    setFinalHeight(mainHeight);
  }, [window?.location?.pathname]);

  const [data, setData] = React.useState([]);

  const fetchData = () => {
    const body = { ...filter }
    body.limit = pageLimit;
    callAPI("POST", `${BASE_URL}/contact/getContactUs`, filter)
      .then((res) => {
        setData(res?.response?.list || []);
        settotalPages(res?.response?.count || 0)
      })
      .catch((err) => {
        notify("error", err.message);
      });
  }

  useEffect(() => {
    fetchData();
  }, [filter])

  const companyList = [
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
    {
      title: 'Name',
      dataIndex: 'firstName',
      id: 'Name',
      key: 'Name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      id: 'email',
      key: 'email',
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      id: 'Subject',
      key: 'Subject',
    },
    {
      title: 'Message',
      dataIndex: 'message',
      width: "40%",
      id: 'message',
      key: 'message',
    },
    {
      id: "action",
      key: "action",
      width: "7%",
      title:
        selectedRowKeys?.length > 0 ? (
          <span
            className="table_delete-btn f_cp"
            onClick={() => {
              setDeleteConfirm(true);
            }}
          >
            Delete
          </span>
        ) : (
          <span>Action</span>
        ),
      render: (x, props, index) => {
        return (
          <React.Fragment>

            <div className='f_flex f_align-center f_content-center'>
              <span
                onClick={(e) => {
                  e.preventDefault();
                  form.setFieldsValue({ name: props.name, email: props.email, phone: props.phone, message: props.message })
                  setSelectedId(props._id);
                  setIsVisibleModal(true);
                }}
                className="f_cp f_icon-small-hover f_flex f_align-center f_content-center">
                <F_EditIcon width='14px' height='14px' />
              </span>
              <span
                className="f_cp f_icon-small-hover f_icon-small-hover-delete f_flex f_align-center f_content-center f_ml-5"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteConfirm(true);
                  setSelectedRowKeys([props._id]);
                }}
              >
                <F_DeleteIcon width="15px" height="15px" />
              </span>
            </div>
          </React.Fragment >
        );
      },
    }
  ]

  const rowSelection = {
    selectedRowKeys: selectedRowKeys,
    onChange: (selectedRowKeys, selectedRows) => {
      if (selectedRows.length === 0) {
        setSelectedRowKeys([]);
      } else {
        setSelectedRowKeys(selectedRowKeys);
      }
    },
  };

  const downloadFile = async () => {
    axios
      .post(`${BASE_URL}/contact/downloadxls`, filter, {
        responseType: "arraybuffer",
        headers: {
          Authorization: UtilLocalService.getLocalStorage(TOKEN_KEY),
        },
      })
      .then((response) => {
        var blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "contact-us.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((error) => {
        console.error("File download failed:", error);
      });
  };


  const handleCreateCompany = (values) => {
    const url = selctedId ? `/contact/updateContactUs/${selctedId}` : `/contact/createContactUs`
    callAPI(`POST`, `${BASE_URL}${url}`, values)
      .then((res) => {
        form.resetFields();
        setIsVisibleModal(false)
        fetchData();
        notify("success", res?.message)
      })
      .catch((err) => {
        notify("error", err?.message)
      });
  }

  const handleUserDelete = () => {
    callAPI("DELETE", `${BASE_URL}/contact/deleteContactUs`, { ids: selectedRowKeys })
      .then((res) => {
        setSelectedRowKeys([]);
        setDeleteConfirm(false);
        fetchData();
        notify("success", res?.message)
      })
      .catch((err) => {
        notify("error", err?.message)
      });
  }

  return (
    <React.Fragment>
      <div className='f_content-main-header f_flex f_align-center f_content-end'>
        {/* <div>
          <Input.Search
            allowClear
            style={{ width: '220px' }}
            className="f_layout-common-search"
            placeholder={"Search Company Name"}
          />
        </div> */}
        <div className="f_flex f_align-center f_content-end">
          {/* <div className='f_ml-10'>
            <Tooltip title="Download PDF" placement='bottom'><span className='f_flex f_align-center f_content-center f_cp f_rollover-icon' onClick={() => downloadFile(true)}><F_DownloadPdfIcon width='14px' height='14px' /></span></Tooltip>
          </div> */}
          <div className='f_ml-10'>
            <Tooltip title="Download Excel" placement='bottom'><span className='f_flex f_align-center f_content-center f_cp f_rollover-icon' onClick={() => downloadFile()}><F_DownloadExcelIcon width='14px' height='14px' /></span></Tooltip>
          </div>
          <div className='f_ml-10'>
            <Button type="primary" className="f_flex f_align-center f_content-center" onClick={() => setIsVisibleModal(true)}><F_PlusIcon width='12px' height='12px' fill='#fff' /> Add</Button>
          </div>
        </div>
      </div>

      <div className="f_content-main-inner" style={{ height: `calc(100vh - ${finalHeight}px)` }}>
        <Table columns={companyList}
          dataSource={data}
          pagination={false}
          className='f_listing-antd-table'
          rowKey={(record) => record._id}
          rowSelection={{
            type: "checkbox",
            ...rowSelection,
          }}
        />
      </div>

      <div className="f_content-main-pagination">
        <Pagination
          current={filter.page}
          total={totalPages}
          pageSize={pageLimit}
          showSizeChanger={true}
          onChange={(page) => setFilter({ ...filter, page: page })}
          onShowSizeChange={(a, size) => {
            setPageLimit(size)
          }
          }
        />
      </div>

      {visibleModal && <Modal
        title={selctedId ? "Edit Contact Us" : "Add Contact Us"}
        okText="Save"
        width="700px"
        open={visibleModal}
        cancelText="Cancel"
        onCancel={() => { setIsVisibleModal(false); form.resetFields(); setSelectedId('') }}
        onOk={(e) => {
          form
            .validateFields()
            .then((values) => {
              handleCreateCompany(values);
            })
            .catch((info) => {
              console.log('Validation Failed:', info);
            });
        }}
      >
        <Form layout="vertical" size='large' form={form}>
          <Row gutter={10}>
            <Col span={12}>
              <Form.Item
                label='Name'
                name="fullName"
                className='f_mb-10'
                rules={[{ required: true, message: 'Please enter Name' }]}>
                <Input
                  placeholder='Enter Name'
                  autoComplete='off'
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                className="label"
                label="Email"
                name="email"
                normalize={(value) => value?.trim()}
                rules={[
                  {
                    required: true,
                    type: "email",
                    message: 'Please enter valid email.'
                  }
                ]}
              >
                <Input
                  placeholder="Enter email"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                className="label"
                label="Subject"
                name="subject"
                rules={[
                  {
                    required: true,
                    type: 'string',
                    message: 'Please enter Subject'
                  }
                ]}
              >
                <Input
                  placeholder=" Please enter subject"
                  autoComplete='off' autoFocus allowClear={true}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='message'
                label='Message'
                rules={[
                  {
                    required: true,
                    type: 'string',
                    message: 'Please enter Message'
                  }
                ]}
              >
                <Input placeholder='Enter Message' autoComplete='off' autoFocus allowClear={true} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>}

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
              onClick={() => handleUserDelete()}
              danger
              type="primary"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </React.Fragment>
  )
}

export default ContactsUs