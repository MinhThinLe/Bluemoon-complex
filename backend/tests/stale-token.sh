session_token=$(
    curl localhost:3030 \
        -H "Authorization: Basic YWRtaW46cGFzc3dvcmQK" \
        -i 2> /dev/null | grep "Session-Token"
    )

if [[ $session_token == "" ]]; then
    echo Server down
    exit 1
fi

stale_cookie=$(echo $session_token | sed "s/set-cookie: //" | tr -d '[:space:]')

session_token=$(
    curl localhost:3030 \
        -H "Authorization: Basic YWRtaW46cGFzc3dvcmQK" \
        -i 2> /dev/null | grep "Session-Token"
    )

if [[ $session_token == "" ]]; then
    echo Server down
    exit 1
fi

fresh_cookie=$(echo $session_token | sed "s/set-cookie: //" | tr -d '[:space:]')

curl -f localhost:3030/api/fee-types \
    --cookie "$stale_cookie" 2> /dev/null

if [ $? == 0 ]; then
    echo Using a stale cookie should fail
    exit 1
fi

curl -f localhost:3030/api/fee-types \
    --cookie "$fresh_cookie" 2> /dev/null

if [ $? != 0 ]; then
    echo Using a fresh cookie should not fail
    exit 1
fi

exit 0
