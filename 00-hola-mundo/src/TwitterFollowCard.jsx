import { useState } from "react"

export function TwitterFollowCard ({username, name, initialIsFollowing}) {
    const [isFollowing, setIsFollow] = useState(initialIsFollowing);

    const text = isFollowing ? 'Siguiendo' : 'Seguir'
    const buttonClassName = isFollowing
    ? 'tw-followCard-button is-following'
    : 'tw-followCard-button'

    const handleclick = () => {
        setIsFollow(!isFollowing);
    }

    return (
        <article className='tw-followCard'>
            <header className='tw-followCard-header'>
                <img
                    className='tw-followCard-avatar' 
                    alt="El Avatar de Mayra" 
                    src={`https://unavatar.io/${username}`}/>
                    <div className='tw-followCard-info'>
                        <strong>{name}</strong>
                        <span
                            className='tw-followCard-infoUserName'>@{username}
                        </span>
                    </div>
            </header>

            <aside>
                <button className={buttonClassName} onClick={handleclick}>
                    <span className="tw-followCard-text">{text}</span>
                    <span className="tw-followCard-stopFollow">Dejar de seguir</span>
                </button>
            </aside>
        </article>
    )  
}