var url = 'https://lol-item-nodeapp-production.up.railway.app/'
var emptyIcon = 'https://raw.communitydragon.org/latest/game/data/images/empty32.png'
class App extends React.Component {
    constructor() {
        super()
        this.state = ({
            topTracks: {},
            recentTracks: {},
        })        
    }

    async componentDidMount() {
        let data = await getTracks()
        this.setState({
            topTracks: data.topTracks,
            recentTracks: data.recentTracks,
        })
    }

    render() {
        const {topTracks, recentTracks} = this.state
        let topArr = []
        let recArr = []
        for(let i in topTracks) {
            topArr.push(<li key={`top${i}`}>{topTracks[i]}</li>)
        }
        for(let i in recentTracks) {
            recArr.push(<li key={`rec${i}`}>{recentTracks[i]}</li>)
        }
        
        return (
            <React.Fragment>
                <div className='top-track'>
                    <ul>
                        {topArr}
                    </ul>
                </div>
                <div className='recent-track'>
                    <ul>
                        {recArr}
                    </ul>
                </div>
            </React.Fragment>
        )
    }
}

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(<App />);

async function getTracks() {
    let tracks = await fetch('http://localhost:3000/getTracks')
    let data = await tracks.json()
    return(data)
}
