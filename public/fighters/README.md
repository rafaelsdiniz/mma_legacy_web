# Fotos dos atletas

Coloque cada foto aqui com o nome igual ao **slug** do atleta, que é o mesmo que
a API devolve em `GET /api/lutadores`.

```text
alex-pereira.png
islam-makhachev.png
charles-oliveira.jpg
```

O slug é o nome sem acento, em minúsculas, com hífen no lugar dos espaços:
"Alex Pereira" vira `alex-pereira`, "José Aldo" vira `jose-aldo`.

## Formato

`.png` e `.jpg` funcionam — o componente tenta nessa ordem. Quem não tiver
arquivo aqui aparece com a silhueta, sem quebrar nada.

## Enquadramento

A imagem é recortada em octógono, com o corte alinhado ao **topo**. Prefira
fotos em que o rosto está na parte de cima do quadro; retrato quadrado de
400×400 é o que fica melhor.

## Direitos

Se a foto não for sua, confira a licença antes de publicar. Imagens de bancos
como o Wikimedia Commons costumam exigir crédito ao autor, e material de
divulgação do UFC é protegido.
