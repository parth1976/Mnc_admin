import React, { useState, useMemo } from "react";
import {
  Badge,
  Dropdown as AntDropdown,
  Input,
  Row,
  Form,
  Modal,
  Col,
} from "antd";
import {
  F_ChangePasswordIcon,
  F_CompanyIcon,
  F_DashboardIcon,
  F_DownArrowIcon,
  F_LogoutIcon,
  F_MultiUserIcon,
} from "../Icons";
import { useSelector } from "react-redux";
import { callAPI, logoutClear } from "../utils/api";
import { BASE_URL } from "../constanats";
import { notify } from "../utils/localServiceUtil";

const Header = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [visibleChangesPwdModal, setIsVisibleChangesPwdModal] = useState(false);
  const authUser = useSelector((state) => state.auth.authUser);
  const [form] = Form.useForm();

  const Menu = (
    <ul>
      <li
        className="f_flex f_align-center f_cp f_icon-hover"
        onClick={() => setIsVisibleChangesPwdModal(true)}
      >
        <F_ChangePasswordIcon width="14px" height="14px" className="f_mr-5" />
        Change Password
      </li>
      <li className="f_flex f_align-center f_cp f_clear-filter"
        onClick={() => logoutClear()}
      >
        <F_LogoutIcon
          fill="#d1293d"
          width="14px"
          height="14px"
          className="f_mr-5"
        />
        Logout
      </li>
    </ul>
  );

  const containsUrl = (url, checkUrl) => {
    if (url.includes(checkUrl)) {
      return url;
    }
  };

  const getTitle = useMemo(() => {
    const currentUrl = window.location.pathname;
    switch (currentUrl) {
      // Routes
      case containsUrl(currentUrl, "/dashboard"):
        return (
          <div className="f_flex f_align-center">
            <F_DashboardIcon width="18px" height="18px" />
            <h6>Dashboard</h6>
            <Badge count={0} />
          </div>
        );
      case containsUrl(currentUrl, "/contacts"):
        return (
          <div className="f_flex f_align-center">
            <F_MultiUserIcon width="18px" height="18px" />
            <h6>Users</h6>
            <Badge count={0} />
          </div>
        );
      case containsUrl(currentUrl, "/contactUs"):
        return (
          <div className="f_flex f_align-center">
            <F_MultiUserIcon width="18px" height="18px" />
            <h6>Contact Us</h6>
            <Badge count={0} />
          </div>
        );
      case containsUrl(currentUrl, "/firstGame"):
        return (
          <div className="f_flex f_align-center">
            <F_CompanyIcon width="18px" height="18px" />
            <h6>FirstGame</h6>
            <Badge count={0} />
          </div>
        );
      case containsUrl(currentUrl, "/secondGame"):
        return (
          <div className="f_flex f_align-center">
            <F_CompanyIcon width="18px" height="18px" />
            <h6>Game2</h6>
            <Badge count={0} />
          </div>
        );
      case containsUrl(currentUrl, "/thirdGame"):
        return (
          <div className="f_flex f_align-center">
            <F_CompanyIcon width="18px" height="18px" />
            <h6>Game3</h6>
            <Badge count={0} />
          </div>
        );
      default:
        return <div> &nbsp;</div>;
    }
  }, [window.location?.pathname]);

  const getLogo = () => {
    const img_style = { height: "36px", width: "36px", borderRadius: "50%" };
    const authUser = {
      firstName: "admin",
      lastName: "admin",
    };
    try {
      if (authUser?.logoUrl) {
        const path = authUser?.logoUrl;
        return <img src={path} alt={""} style={img_style} />;
      } else {
        return (
          authUser?.firstName
            ?.split(" ")
            .map((name) => name[0])
            .join("")
            .toUpperCase() +
          authUser?.lastName
            ?.split(" ")
            .map((name) => name[0])
            .join("")
            .toUpperCase()
        );
      }
    } catch (error) { }
  };


  return (
    <React.Fragment>
      <div
        className="f_flex f_content-between f_align-center f_layout-content-header f_content-between"
        id="f_layout-content-header"
      >
        <div className="f_layout-content-header-breadcrumb">{getTitle}</div>
        <div className="f_flex f_content-end f_align-center">

          <div className="f_ml-10">
            <AntDropdown
              overlay={visibleChangesPwdModal ? "" : Menu}
              trigger={["click"]}
              overlayClassName="f_common-dropdown"
              className="f_cp f_header-user"
              placement="bottomRight"
            >
              <div
                className="f_flex f_align-center f_cp"
                onClick={() => setCollapsed(!collapsed)}
              >
                <div className="f_flex f_align-center f_content-center">
                  <span className="f_header-user-icon">{getLogo()}</span>
                  <F_DownArrowIcon width="12px" height="12px" />
                </div>
              </div>
            </AntDropdown>
          </div>
        </div>
      </div>

      {visibleChangesPwdModal && (
        <Modal
          title="Changes Password"
          okText="Change Password"
          onOk={() => {
            callAPI('POST', `${BASE_URL}/auth/change-password`, { ...form.getFieldsValue() })
              .then((res) => {
                if (res && res.code == "OK") {
                  notify('success', res?.message)
                  setIsVisibleChangesPwdModal(false)
                  setTimeout(() => {
                    logoutClear();
                  }, 1000);
                }
              })
              .catch((err) => {
                notify('error', err?.message)
              })
          }}
          width="500px"
          open={visibleChangesPwdModal}
          cancelText="Cancel"
          onCancel={() => setIsVisibleChangesPwdModal(false)}
        >
          <Form layout="vertical" size="large" autoComplete="off" form={form}>
            <Row gutter={10}>
              <Col span={24}>
                <Form.Item
                  className="label f_mb-10"
                  label="Current Password"
                  name="password"
                  rules={[
                    {
                      required: true,
                      message: "Please enter New password.",
                    },
                  ]}
                >
                  <Input.Password placeholder="Enter New password" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  className="label f_mb-0"
                  label="New Password"
                  name="newPassword"
                  rules={[
                    {
                      required: true,
                      message: "Please enter Confirm password.",
                    },
                  ]}
                >
                  <Input.Password placeholder="Enter Confirm password" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      )}
    </React.Fragment>
  );
};
export default Header;
