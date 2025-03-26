import React, { useEffect, useState, useCallback, useContext } from "react";
import { Table, Button, Avatar, Tag, message, Tooltip } from "antd";
import msgpack from "msgpack-lite";
import { io } from "socket.io-client";
import { BASE_URL } from "../constanats";
import { useSelector } from "react-redux";
import ExitIcon from "../components/ReportChartNoData/ExitIcon";


const GameSessionsAdmin = () => {
    const socket = React.useRef(null);
    const [sessions, setSessions] = useState([]);
    const authUser = useSelector((state) => state.auth.authUser);
    const [socketData, setSocketData] = useState(null);
    const playerId = authUser?._id;

    const connectSocket = () => {
        if (!playerId) return

        const url = `${BASE_URL}/?playerId=${playerId}`;

        socket.current = io(url, {
            transports: ["websocket"], // Force WebSocket transport
            withCredentials: true, // Include cookies/auth headers if needed
            reconnection: true, // Automatically reconnect on failure
            reconnectionAttempts: 5, // Retry connection up to 5 times
            reconnectionDelay: 1000, // Wait 1s before reconnecting
        });
        setSocketData(socket.current);

        socket.current.on('connected', (data) => {
            console.log('Connected to the server', data);
            socket.current.emit('adminSession');
            // Store the socket ID in ref/local storage
        });

        socket.current.on("liveSessionData", (bufferData) => {

            // Ensure bufferData is a valid Uint8Array
            let dataToDecode;
            if (bufferData instanceof ArrayBuffer) {
                dataToDecode = new Uint8Array(bufferData);
            } else if (bufferData?.data) {
                dataToDecode = new Uint8Array(bufferData.data);
            } else {
                dataToDecode = bufferData;
            }

            try {
                const jsonData = msgpack.decode(dataToDecode);
                const transformedData = Object.entries(jsonData?.session).map(([sessionKey, session]) => ({
                    key: sessionKey,
                    gameId: session.gameId,
                    playerNames: session.playerDetails.map((player, i) => `${i + 1} ${player.firstName} ${player.lastName}`).join('\n').split('\n').map((line, index) => (
                        <div key={index}>{line}</div>
                    )),
                    playerDetails: session?.playerDetails,
                    currentQuestion: session?.gameId == 1 ? session?.gameDetail?.find(question => question._id == session?.currentQuestion)?.question : session.questionDetail?.Situation || 'No Question',
                    remainingTime: jsonData?.playerTimeoutsData[sessionKey]?.remainingTime || 'N/A',
                    inQuestion: (session?.gameId == 1 && session?.locked) ? jsonData?.playerTimeoutsData[sessionKey]?.isQuestion ? 'Question' : 'Review' : 'N/A',
                    timerType: session?.locked ? 'In Game' : 'In Queue',
                    disconnectTime: session?.playerDetails?.map(player => {
                        return jsonData.playerDisconnectTimeoutsData[player._id] ? `${player.firstName} ${player.lastName}: ${jsonData.playerDisconnectTimeoutsData[player._id]}` : ''
                    }).join('\n').split('\n').map((line, index) => (
                        <div key={index}>{line}</div>
                    )),
                }));

                setSessions(transformedData);
                console.log("Decoded JSON data:", jsonData);
            } catch (error) {
                console.error("Error decoding buffer data:", error);
            }
        });

        socket.current.on('adminConnected', (data) => {
            console.log('adminConnected', data);
            // Store the socket ID in ref/local storage
        });

        socket.current.on('connect_error', (error) => {
            if (error.message === 'Unauthorized') {
                console.error('Unauthorized: Your token is invalid or expired.');
                // Handle unauthorized error (e.g., redirect to login)
            } else {
                console.error('Error connecting to the server:', error.message);
            }
        });
    };

    useEffect(() => {
        connectSocket();

        // Clean up the socket and event listener when the component unmounts
        return () => {
            if (socket.current) {
                socket.current.disconnect();
            }
        };
    }, [playerId]);

    const handleRemovePlayer = (key, playerId) => {
        socketData?.emit('adminRemoveUserFromSession', { roomCode: key, userId: playerId });
    };

    const closeUserSession = (key) => {
        socketData?.emit('adminCloseUserSession', { roomCode: key });
    };

    const columns = [
        {
            title: 'Game ID',
            dataIndex: 'gameId',
            key: 'gameId',
        },
        {
            title: 'Queue/In Game',
            dataIndex: 'timerType',
            key: 'timerType',
        },
        {
            title: 'Question/Review',
            dataIndex: 'inQuestion',
            key: 'inQuestion',
        },
        // {
        //     title: 'Player Names',
        //     dataIndex: 'playerNames',
        //     key: 'playerNames',
        //     width: '10%',
        // },
        {
            title: "Players",
            key: "players",
            width: '16%',
            render: (_, record, index) => {
                return (
                    <div>
                        {record.playerDetails.map((player) => (
                            <div key={player._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: index === record.playerDetails.length - 1 ? 'none' : '1px solid #ccc', marginBottom: '8px' }}>
                                <span style={{ marginLeft: '8px' }}>
                                    {player.firstName} {player.lastName}
                                </span>
                                <span onClick={() => handleRemovePlayer(record?.key, player._id)} >
                                    <ExitIcon />
                                </span>
                                {/* <Button danger size="small" onClick={() => handleRemovePlayer(player._id, player._id)} style={{ marginLeft: '8px' }}>
                                    Remove
                                </Button> */}
                            </div>
                        ))}
                    </div>
                );
            },
        },
        {
            title: 'Current Question',
            dataIndex: 'currentQuestion',
            key: 'currentQuestion',
        },
        {
            title: 'Remaining Time (s)',
            dataIndex: 'remainingTime',
            key: 'remainingTime',
        },
        {
            title: 'Disconnect Time',
            dataIndex: 'disconnectTime',
            key: 'disconnectTime',
            width: '10%',
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <span onClick={() => closeUserSession(record?.key)} >
                    <ExitIcon width="28px" height="28px" />
                </span>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Game Sessions</h1>
            <Table
                dataSource={sessions}
                columns={columns}
                rowKey="sessionKey"
                bordered
            />
        </div>
    );
};

export default GameSessionsAdmin;
