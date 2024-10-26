import { useState } from "react"

export function TwitterFollowCard ({username, name, isFollowing}) {
    const text = isFollowing ? 'Siguiendo' : 'Seguir'
    const buttonClassName = isFollowing
    ? 'tw-followCard-button is-following'
    : 'tw-followCard-button'

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
                <button className={buttonClassName}>
                    {text}
                </button>
            </aside>
        </article>
    )  
}