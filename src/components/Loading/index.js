import "./index.css"
import {BallTriangle} from 'react-loader-spinner'

export const Loading = () => {
    return(
        <div className = "loading-container">
            <BallTriangle
                height={70}
                width={100}
                radius={5}
                color="#4fa94d"
                ariaLabel="ball-triangle-loading"
                wrapperStyle={{}}
                wrapperClass=""
                visible={true}
            />
        </div>
    )
}