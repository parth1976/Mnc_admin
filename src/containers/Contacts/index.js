import React, { useEffect, useState } from 'react'
import { Input, Button, Tooltip, Table, Pagination, Modal, Row, Form, Col } from "antd";
import { F_DeleteIcon, F_DownloadExcelIcon, F_DownloadPdfIcon, F_EditIcon, F_PlusIcon } from "../../Icons";
import { callAPI } from '../../utils/api';
import { BASE_URL, TOKEN_KEY } from '../../constanats';
import UtilLocalService, { notify } from '../../utils/localServiceUtil';
import axios from 'axios';

const Company = () => {
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
    callAPI("POST", `${BASE_URL}/admin/player/getPlayers`, filter)
      .then((res) => {
        setData(res?.response?.list);
        settotalPages(res?.response?.count)
      })
      .catch((err) => {
        notify("error", err.message);
      });
  }

  const fetchPlayerDetails = (playerId) => {

    callAPI("GET", `${BASE_URL}/admin/player/getPlayerById/${playerId}`)
      .then((res) => {
        form.setFieldsValue({ ...res?.player });
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
      render: (x, props, index) => (
        <span>{props?.firstName} {props?.lastName}</span>
      )
    },
    {
      title: 'Email',
      dataIndex: 'email',
      id: 'email',
      key: 'email',
    },
    {
      title: 'Mobile',
      dataIndex: 'mobileNumber',
      id: 'Mobile',
      key: 'Mobile',
      render: (x, props, index) => (
        <span>{props?.mobileNumber || "-"}</span>
      )
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
                  fetchPlayerDetails(props._id);
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

  const finalData = data.map((val, index) => ({
    ...val, key: index + 1
  }));

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
      .post(`${BASE_URL}/admin/contact/download-xls`, filter, {
        responseType: "arraybuffer",
        headers: {
          Authorization: "Bearer " + UtilLocalService.getLocalStorage(TOKEN_KEY),
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
    const url = selctedId ? `/admin/player/updatePlayer/${selctedId}` : `/admin/player/create`
    const method = "POST";
    callAPI(`${method}`, `${BASE_URL}${url}`, values)
      .then((res) => {
        if (res && res.code == "OK") {
          form.resetFields();
          setIsVisibleModal(false)
          fetchData();
          notify("success", res?.message)
        }
      })
      .catch((err) => {
        notify("error", err?.message)
      });
  }

  const handleUserDelete = () => {
    callAPI("DELETE", `${BASE_URL}/admin/player/${selectedRowKeys?.length > 1 ? "deletePlayers" : "deletePlayer"}`, { ids: selectedRowKeys?.length > 1 ? selectedRowKeys : selectedRowKeys[0] })
      .then((res) => {
        if (res) {
          setSelectedRowKeys([]);
          setDeleteConfirm(false);
          fetchData();
          notify("success", res?.message)
        }
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
          dataSource={finalData}
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
        title={selctedId ? "Edit Player" : "Add Player"}
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
        <Form
          layout="vertical"
          size="medium"
          form={form}
        >
          <div className="f_row">
            <div className="f_col-6">
              <Form.Item
                name="firstName"
                label='First Name'
                rules={[
                  {
                    required: true,
                    message: 'Please provide a first name',
                  },
                  {
                    max: 20,
                    message: 'First name cannot be more than 20 characters',
                  },
                  {
                    min: 2,
                    message: 'First name cannot be less than 2 characters',
                  },
                ]}
              >
                <Input placeholder="Enter Your First Name" />
              </Form.Item>
            </div>
            <div className="f_col-6">
              <Form.Item
                name="lastName"
                label='Last Name'
                rules={[
                  {
                    required: true,
                    message: 'Please provide a last name',
                  },
                  {
                    max: 20,
                    message: 'Last name cannot be more than 20 characters',
                  },
                  {
                    min: 2,
                    message: 'Last name cannot be less than 2 characters',
                  },
                ]}
              >
                <Input placeholder="Enter Your Last Name" />
              </Form.Item>
            </div>
            <div className="f_col-6">
              <Form.Item
                name="mobileNumber"
                label='Mobile Number'
                rules={[
                  {
                    pattern: /^\d{10}$/,
                    message: 'Please enter a 10 digit mobile number',
                  },
                ]}
              >
                <Input placeholder="Enter Your Mobile Number" />
              </Form.Item>
            </div>
            <div className="f_col-6">
              <Form.Item
                name="email"
                label='Email'
              >
                <Input placeholder="Enter Your Email" disabled={true} />
              </Form.Item>
            </div>
            <div className="f_col-12">
              <h6 className="f_fw-1200 f_fs-14 f_mb-20">Education Details</h6>
            </div>
            <div className="f_col-6">
              <Form.Item
                name={["educationDetails", "education"]}
                label='Education'
                normalize={(value) => (value === undefined || value.length === 0 ? "" : value)}
              >
                <Input placeholder="Enter Your LinkedIn Profile" />
              </Form.Item>
            </div>
            <div className="f_col-6">
              <Form.Item
                name={["educationDetails", "skills_expertise"]}
                label='Skills & Expertise'
                normalize={(value) => (value === undefined || value.length === 0 ? "" : value)}
              >
                <Input placeholder="Enter Your Skills & Expertise" />
              </Form.Item>
            </div>
            <div className="f_col-12">
              <Form.Item
                name={["educationDetails", "address"]}
                label='Address'
                normalize={(value) => (value === undefined || value.length === 0 ? "" : value)}
              >
                <Input.TextArea placeholder="Enter Your Address" autoSize={{ minRows: 2, maxRows: 4 }} />
              </Form.Item>
            </div>
            <div className="f_col-12">
              <h4 className="f_fw-1200 f_fs-14 f_mb-20">Professional Details</h4>
            </div>
            <div className="f_col-6">
              <Form.Item
                name={["professionalDetails", "currentJob"]}
                label='Current Job'
                normalize={(value) => (value === undefined || value.length === 0 ? "" : value)}
              >
                <Input placeholder="Enter Your Current Job" />
              </Form.Item>
            </div>
            <div className="f_col-6">
              <Form.Item
                name={["professionalDetails", "companyName"]}
                label='Company Name'
                normalize={(value) => (value === undefined || value.length === 0 ? "" : value)}
              >
                <Input placeholder="Enter Your Company Name" />
              </Form.Item>
            </div>
            <div className="f_col-6">
              <Form.Item
                name={["professionalDetails", "jobRole"]}
                label='Job Role'
                normalize={(value) => (value === undefined || value.length === 0 ? "" : value)}
              >
                <Input placeholder="Enter Your Job Role" />
              </Form.Item>
            </div>
            <div className="f_col-6">
              <Form.Item
                name={["professionalDetails", "linkedInProfile"]}
                label='LinkedIn Profile'
                normalize={(value) => (value === undefined || value.length === 0 ? "" : value)}
              >
                <Input placeholder="Enter Your LinkedIn Profile" />
              </Form.Item>
            </div>
            <div className="f_col-6">
              <Form.Item
                name={["professionalDetails", "skills"]}
                label='Skills'
                normalize={(value) => (value === undefined || value.length === 0 ? "" : value)}
              >
                <Input placeholder="Enter Your Skills" />
              </Form.Item>
            </div>
            <div className="f_col-6">
              <Form.Item
                name={["professionalDetails", "expertise"]}
                label='Expertise'
                normalize={(value) => (value === undefined || value.length === 0 ? "" : value)}
              >
                <Input placeholder="Enter Your Expertise" />
              </Form.Item>
            </div>
          </div>
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

export default Company