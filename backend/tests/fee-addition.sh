session_token=$(
    curl localhost:3030 \
        -H "Authorization: Basic YWRtaW46cGFzc3dvcmQK" \
        -i 2> /dev/null | grep "Session-Token"
    )

if [[ $session_token == "" ]]; then
    echo Server down
    exit 1
fi

cookie=$(echo $session_token | sed "s/set-cookie: //" | tr -d '[:space:]')

if [ "$message" != "Invalid apartment id list supplied" ]; then
    echo How did this succeed when there isnt valid data?
fi

message=$(
    curl localhost:3030/api/new/fee \
        --cookie "$cookie" \
        --header "Content-Type: application/json" \
        --data '{ "amount": 1234, "type": 1, "optional": true, "due-on": 12315415 }' \
        2> /dev/null
)

if [ "$message" != "Invalid apartment id list supplied" ]; then
    echo How did this succeed when there isnt valid data?
    exit 1
fi

exit 0
