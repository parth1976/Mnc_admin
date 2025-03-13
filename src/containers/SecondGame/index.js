import React, { useEffect, useState } from 'react'
import { Input, Button, Tooltip, Table, Pagination, Modal, Row, Form, Col } from "antd";
import { F_DeleteIcon, F_DownloadExcelIcon, F_DownloadPdfIcon, F_EditIcon, F_EyeIcon, F_PlusIcon } from "../../Icons";
import { callAPI } from '../../utils/api';
import { BASE_URL, TOKEN_KEY } from '../../constanats';
import UtilLocalService, { notify } from '../../utils/localServiceUtil';
import axios from 'axios';
import moment from 'moment';
import DataDrawer from './secondGameQuestion';

const SecondGame = () => {
  const [finalHeight, setFinalHeight] = useState("");
  const [visibleModal, setIsVisibleModal] = useState(false);
  const [selctedId, setSelectedId] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [filter, setFilter] = useState({
    page: 1,
    limit: 20,
  })
  const [ isVisible , setIsVisible] = useState({levelId: null, visible: false});
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
    callAPI("POST", `${BASE_URL}/admin/secondGame/level/getLevels`, filter)
      .then((res) => {
        setData(res?.response?.list);
        settotalPages(res?.response?.count)
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
      title: 'Level Number',
      dataIndex: 'levelNumber',
      id: 'companyName',
      key: 'companyName',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      id: 'contactPerson',
      key: 'contactPerson',
      render: (createdAt) => moment(createdAt).format("DD-MM-YYYY")
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
                  setIsVisible({ visible: true  , levelId : props?._id});
                }}
                className="f_cp f_icon-small-hover f_flex f_align-center f_content-center">
                <F_EyeIcon width='14px' height='14px' />
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
      .post(`${BASE_URL}/admin/partner/download-xls`, filter, {
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
        link.setAttribute("download", "become_partner.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((error) => {
        console.error("File download failed:", error);
      });
  };


  const handleCreateCompany = (values) => {
    const url = selctedId ? `/admin/partner/${selctedId}` : `/admin/secondGame/level/create`
    const method = selctedId ? "POST" : "POST";
    callAPI(`${method}`, `${BASE_URL}${url}`, values)
      .then((res) => {
        if (res) {
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
    callAPI("DELETE", `${BASE_URL}/admin/secondGame/level/deleteLevels`, { ids: selectedRowKeys })
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

  const onClose = () => {
    setIsVisible({visible: false , levelId : null})
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
        title={selctedId ? "Edit Level" : "Add Level"}
        okText="Save"
        width="350px"
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
            <Col span={24}>
              <Form.Item
                label='Level Number'
                name="levelNumber"
                className='f_mb-10'
                rules={[{ required: true, message: 'Please enter Company Name' }]}>
                <Input
                  placeholder='Enter level number'
                  autoComplete='off'
                />
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
      {isVisible && <DataDrawer levelId={isVisible?.levelId} visible={isVisible?.visible} onClose={onClose}/>}
    </React.Fragment>
  )
}

export default SecondGame