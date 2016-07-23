
mkdir -p ulcs

for f in *.pdf;
do
  pdftotext $f
  ft=${f%.pdf}
  ulcs=$(sed -n 3p ${ft##*/}.txt | sed 's/.*(\(.*\))/\1/')
  echo "ULCS is $ulcs"
  cp $f ulcs/$ulcs.pdf
done
