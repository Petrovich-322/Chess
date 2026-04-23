interface HomeMenuNavBtns {
    confirmBtnHandler: any,
    returnBtnHandler: any,
    confirmBtnTitle: string,
    returnBtnTitle: string,
}

const HomeMenuNavBtns = (props: HomeMenuNavBtns) => {
    const {
        confirmBtnHandler,
        returnBtnHandler,
        confirmBtnTitle,
        returnBtnTitle
    } = props;
    return (
        <div className="home-menu__navigate-container">
            <button
                className="home-menu__btn return-btn"
                onClick={returnBtnHandler}
            >
                {returnBtnTitle}
            </button>
            <button
                className="home-menu__btn confirm-btn"
                onClick={confirmBtnHandler}
            >
                {confirmBtnTitle}
            </button>
        </div>
    );
}

export default HomeMenuNavBtns;