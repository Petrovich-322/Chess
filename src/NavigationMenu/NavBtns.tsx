import { devServAddress } from "@shared/host"

interface NavBtnsProps {
    roomId: string | null;
}   

const NavBtns = ({ roomId }: NavBtnsProps) => {
    return (
        <div className="main-nav__btn-container">
            <button
                className="nav-btn return-home-btn"
                onClick={() => window.location.href = devServAddress}
            >
                Головне меню
            </button>
            {roomId && <button
                className="nav-btn last-game-btn"
                onClick={() => window.location.href = `${devServAddress}game/${roomId}`}
            >
                Остання гра
            </button>
            }
        </div>
    )
}

export default NavBtns;