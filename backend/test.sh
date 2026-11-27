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
    --cookie $cookie)

echo $role
