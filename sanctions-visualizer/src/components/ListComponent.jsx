import React, { useEffect } from "react";
import axios from "axios";

function ListComponent() {
    let list;

    useEffect(() => {
        list = fetchData();
    }, []);


    const fetchData = async () => {
        try{
            const response = await axios.get('https://sanctionslistservice.ofac.treas.gov/changes/latest',
                {withCredentials: true,
                    headers: {
                        'Access-Control-Allow-Origin': 'http://localhost:5173/'}
                }
            )
        }
        catch (error) {
            console.error("Error fetching data:", error);
    }
    return response.data;
}

return(<div>
    List Component
    </div>)
}

export default ListComponent;