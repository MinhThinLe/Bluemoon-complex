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

curl -f localhost:3030/api/new/user \
    --cookie "$cookie" \
    --header "Content-Type: application/json" \
    --data '{
        "username": "John",
        "display-name": "John Bluemoon",
        "password": "password123",
        "role": 2
           }' \
    2> /dev/null

if [ $? != 0 ]; then
    echo Adding another user failed
fi

credential=$(echo "John:password123" | base64 -)

session_token=$(
    curl localhost:3030 \
        -H "Authorization: Basic $credential" \
        -i 2> /dev/null | grep "Session-Token"
    )

if [ $? != 0 ]; then
    echo Failed to sign in with the new account
fi

if [[ $session_token == "" ]]; then
    echo Server down
    exit 1
fi

cookie=$(echo $session_token | sed "s/set-cookie: //" | tr -d '[:space:]')

role=$(curl -f localhost:3030/api/session \
    --cookie $cookie 2> /dev/null)

if [ "$role" != "accountant" ]; then
    echo Not an accountant
fi
