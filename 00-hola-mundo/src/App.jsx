import './App.css'
import './TwitterFollowCard'
import { TwitterFollowCard } from './TwitterFollowCard'

export function App () {
    return (
        <section className='App'>
            <TwitterFollowCard isFollowing username='mayricca' name='Mayra Riccardi' initialIsFollowing={true}></TwitterFollowCard>
            <TwitterFollowCard isFollowing={false} username='pheralb' name='Javier Zanetti'></TwitterFollowCard>
            <TwitterFollowCard isFollowing={false} username='midudev' name='Miguel Ángel Durand' initialIsFollowing={true}></TwitterFollowCard>
            <TwitterFollowCard isFollowing username='vxnder' name='Vanderhart'></TwitterFollowCard>
        </section>
    )
}