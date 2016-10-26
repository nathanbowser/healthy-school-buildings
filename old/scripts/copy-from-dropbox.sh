


for f in /Users/koopa/Dropbox/HSBMap/*;
do
  ulcs=$(echo $f | sed "s/[^0-9]//g")
  #echo $ulcs
  #echo $f
  cp "$f"/* ../data/image/$ulcs/
  #
done
