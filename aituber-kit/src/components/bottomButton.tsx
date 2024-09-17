import React, { useCallback, useRef, useState, useEffect } from 'react'
import { IconButton } from './iconButton'

export const BottomButton = () => {
    const showMemo = () => {
        return
    }
    const editMemo = () => {

    }
    const readBarCode = () => {

    }
    return (
        <>
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
        </>);
};
