# Standard login stuff
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

# Check if the cookie is actually valid
curl -f localhost:3030/api/fee-types \
    --cookie "$cookie" 2> /dev/null

if [ $? != 0 ]; then
    echo Invalid cookie
    exit 1
fi

# Logging out
curl -f "localhost:3030/api/logout" \
    --cookie "$cookie" \
    -X POST

if [ $? != 0 ]; then
    echo Requesting logout failed
    exit 1
fi

# Try to use the cookie again now that we've logged out
curl -f localhost:3030/api/fee-types \
    --cookie "$cookie" 2> /dev/null

if [ $? == 0 ]; then
    echo Should have logged out
    exit 1
fi
