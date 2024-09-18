import React, { useCallback, useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { IconButton } from './iconButton'
import { Form } from './form';
import { handleSendChatFn } from '@/features/chat/handlers';

export const BottomButton = () => {
    const [showForm, setShowForm] = useState(false);
    const { t } = useTranslation()
    const handleSendChat = handleSendChatFn({
        NotConnectedToExternalAssistant: t('NotConnectedToExternalAssistant'),
        APIKeyNotEntered: t('APIKeyNotEntered'),
    })

    //memoの表示と読み上げ
    const showMemo = useCallback(() => {
        if (!showForm) {
            //ここに初期メッセージ
            handleSendChat("おはよう");
        }
        setShowForm(true);
    }, [showForm, handleSendChat])
    //memo編集画面への遷移
    const editMemo = () => {

    }
    //バーコードの読み取り
    const readBarCode = () => {

    }
    const back = () => {
        setShowForm(false);
    }
    return (
        <>
            {showForm ? (
                <><Form />
                    <div className="absolute bottom-0 z-20 m-24" style={{
                        right: '0px',
                        bottom: '12px',
                        transform: 'translate(0%, 0%)',
                    }}>
                        <div
                            className="grid grid-flow-col gap-[8px] mb-40"
                            style={{ width: 'max-content' }}
                        >
                            <div className="order-3">
                                <IconButton
                                    iconName="24/Prev"
                                    isProcessing={false}
                                    onClick={back}
                                />
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="absolute bottom-0 z-20 m-24" style={{
                    left: '50%',
                    transform: 'translate(-50%, 0%)',
                }}>
                    <div
                        className="grid grid-flow-col gap-[8px] mb-40"
                        style={{ width: 'max-content' }}
                    >
                        <div className="order-3">
                            <IconButton
                                iconName="32/CommentOn"
                                isProcessing={false}
                                onClick={showMemo}
                            />
                        </div>
                        <div className="order-4">
                            <IconButton
                                iconName="32/Edit"
                                isProcessing={false}
                                onClick={editMemo}
                            />
                        </div>
                        <div className="order-5">
                            <IconButton
                                iconName="32/Camera"
                                isProcessing={false}
                                onClick={readBarCode}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
